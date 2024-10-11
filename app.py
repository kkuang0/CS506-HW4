from flask import Flask, render_template, request, jsonify
from sklearn.datasets import fetch_20newsgroups
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import TruncatedSVD
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import nltk
from nltk.corpus import stopwords

nltk.download('stopwords')

app = Flask(__name__)

# Fetch dataset
categories = ['sci.space', 'comp.graphics', 'rec.sport.baseball', 'talk.politics.guns']
newsgroups_data = fetch_20newsgroups(subset='all', categories=categories)

# Initialize vectorizer and remove stopwords
stop_words = list(stopwords.words('english'))  # Convert set to list
vectorizer = TfidfVectorizer(stop_words=stop_words, max_features=1000)
X = vectorizer.fit_transform(newsgroups_data.data)

# Perform Latent Semantic Analysis (LSA)
svd = TruncatedSVD(n_components=100)
X_lsa = svd.fit_transform(X)

def search_engine(query):
    """
    Function to search for top 5 similar documents given a query
    Input: query (str)
    Output: documents (list), similarities (list), indices (list)
    """
    # Transform query into vectorized and LSA space
    query_vec = vectorizer.transform([query])
    query_lsa = svd.transform(query_vec)

    # Compute cosine similarity between query and all documents
    similarities = cosine_similarity(query_lsa, X_lsa).flatten()

    # Get top 5 similar documents
    top_indices = np.argsort(similarities)[-5:][::-1]
    top_similarities = similarities[top_indices]
    top_documents = [newsgroups_data.data[i] for i in top_indices]

    if len(top_documents) > 0:
        return top_documents, top_similarities, top_indices.tolist()
    else:
        return [], [], []

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/search', methods=['POST'])
def search():
    query = request.form['query']
    documents, similarities, indices = search_engine(query)
    similarities = similarities.tolist()
    return jsonify({'documents': documents, 'similarities': similarities, 'indices': indices})

if __name__ == '__main__':
    app.run(debug=True)
