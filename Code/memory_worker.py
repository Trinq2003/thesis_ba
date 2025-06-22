# Memory block arrangement method (choose memory topic to store memory block)
def _is_directly_connected(self, new_query: str, prev_response: str) -> bool:
    """
    Check if the new query is directly connected to the previous response.
    Uses coreference resolution, subject detection, and entity overlap.
    """
    # Combine previous response and new query for coreference resolution
    combined_text = prev_response + " " + new_query
    doc = self._nlp(combined_text)
    
    # Check for coreferences linking the new query to the previous response
    for token in doc:
        if token.dep_ in ["conj", "appos"]:
            return True
    
    # Check if the new query lacks a subject (indicating reliance on previous context)
    query_doc = self._nlp(new_query)
    has_subject = any(token.dep_ == "nsubj" for token in query_doc)
    if not has_subject:
        return True
    
    # Check if the new query introduces a new subject or entity
    prev_entities = set(ent.text.lower() for ent in self._nlp(prev_response).ents)
    query_entities = set(ent.text.lower() for ent in query_doc.ents)
    new_entities = query_entities - prev_entities
    if not new_entities and query_entities:  # Shared entities, no new ones
        return True
    
    return False

def select_relevant_topics(self, new_query: str, prev_response: str, topics: List[AbstractMemoryTopic], top_n: int = 1) -> List[AbstractMemoryTopic]:
    """
    Select the most relevant memory topic(s) for the new query.
    If directly connected to the previous response, return the current topic.
    Otherwise, use semantic similarity, keyword matching, NER, and temporal weighting.
    """
    if not topics:
        return []
    
    # If directly connected, return the most recent topic (assumed current)
    if self._is_directly_connected(new_query, prev_response):
        return [topics[-1]]
    
    # Encode the new query
    query_embedding = self._emb_model.encode(new_query)
    query_doc = self._nlp(new_query)
    query_entities = set(ent.text.lower() for ent in query_doc.ents)
    query_tokens = set(new_query.lower().split())
    
    # Compute similarity scores for all topics
    similarity_scores = []
    current_time = datetime.now()
    
    for topic in topics:
        # Semantic similarity
        sem_sim = torch.cosine_similarity(query_embedding, topic.identifying_features["refined_context_embedding"]).item()
        
        # Keyword matching (simple overlap)
        context_tokens = set(topic.context.lower().split())
        keyword_overlap = len(query_tokens.intersection(context_tokens)) / max(len(query_tokens), 1)
        
        # NER-based matching
        topic_doc = self._nlp(topic.context)
        topic_entities = set(ent.text.lower() for ent in topic_doc.ents)
        entity_overlap = len(query_entities.intersection(topic_entities)) / max(len(query_entities), 1) if query_entities else 0
        
        # Temporal weighting (more recent topics get a slight boost)
        time_diff = (current_time - topic.timestamp).total_seconds() / (24 * 3600)  # Days difference
        temporal_weight = max(0.5, 1 - time_diff / 30)  # Decay over 30 days, min 0.5
        
        # Combine scores with weights
        combined_score = (0.5 * sem_sim) + (0.2 * keyword_overlap) + (0.2 * entity_overlap) + (0.1 * temporal_weight)
        similarity_scores.append((topic, combined_score))
    
    # Sort by score and return top N topics
    similarity_scores.sort(key=lambda x: x[1], reverse=True)
    return [topic for topic, _ in similarity_scores[:top_n]]