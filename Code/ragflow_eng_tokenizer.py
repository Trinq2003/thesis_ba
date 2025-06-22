from nltk.stem import PorterStemmer, WordNetLemmatizer
self.stemmer = PorterStemmer()
self.lemmatizer = WordNetLemmatizer()
res.extend([self.stemmer.stem(self.lemmatizer.lemmatize(t)) for t in word_tokenize(L)])