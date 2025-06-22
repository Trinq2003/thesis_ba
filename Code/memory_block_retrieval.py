def memory_block_retrieval(self, mem_block: AbstractMemoryBlock, top_k: int = 5) -> List[AbstractMemoryBlock]:
    container_topic_id = mem_block.topic_container_id
    list_of_mem_blocks = AbstractMemoryTopic.get_memtopic_instance_by_id(container_topic_id).chain_of_memblocks
    current_turn = len(list_of_mem_blocks)
    
    input_query = mem_block.input_query
    input_query_emb = self._emb_model.encode(input_query)
    
    score_list = []
    
    for (turn_number, mem_block) in enumerate(list_of_mem_blocks):
        # Calculate the temporal score
        temporal_score = self._retrieval_temporal_score(turn_number, current_turn)
        
        # Calculate the access score
        access_count = mem_block.access_count
        access_score = self._retrieval_access_score(access_count)
        
        # Calculate the similarity score
        raw_input_emb = mem_block.identifying_features["feature_for_raw_context"]["input_embedding"]
        raw_input_emb_similarity = self._emb_model.similarity(input_query, raw_input_emb)
        raw_output_emb = mem_block.identifying_features["feature_for_raw_context"]["output_embedding"]
        raw_output_emb_similarity = self._emb_model.similarity(input_query, raw_output_emb)
        refined_input_emb = mem_block.identifying_features["feature_for_refined_context"]["refined_input_embedding"]
        refined_input_emb_similarity = self._retrieval_semantic_similarity_score(input_query_emb, refined_input_emb)
        refined_output_emb = mem_block.identifying_features["feature_for_refined_context"]["refined_output_embedding"]
        refined_output_emb_similarity = self._retrieval_semantic_similarity_score(input_query_emb, refined_output_emb)
        
        semantic_similarity_score = self._retrieval_semantic_similarity_score(raw_input_emb_similarity, raw_output_emb_similarity, refined_input_emb_similarity, refined_output_emb_similarity)
        # Calculate the overall retrieval score
        retrieval_score = self._retrieval_score(temporal_score, access_score, semantic_similarity_score)

        score_list.append((mem_block, retrieval_score))
    
    score_list.sort(key=lambda x: x[1], reverse=True)
    
    return [mem_block for mem_block, score in score_list[:top_k]]