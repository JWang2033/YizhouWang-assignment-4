from flask import Flask, render_template, request, jsonify
from sklearn.datasets import fetch_20newsgroups
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import TruncatedSVD
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

app = Flask(__name__)

# Load the 20 Newsgroups dataset
newsgroups_data = fetch_20newsgroups(subset='all')['data']

# Preprocess: Convert documents to TF-IDF matrix
tfidf_vectorizer = TfidfVectorizer(stop_words='english', max_features=10000)
tfidf_matrix = tfidf_vectorizer.fit_transform(newsgroups_data)

# Apply LSA (SVD) to reduce dimensions
svd = TruncatedSVD(n_components=100)
lsa_matrix = svd.fit_transform(tfidf_matrix)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/search', methods=['POST'])
def search():
    # Get the query from the form data
    query = request.form['query']

    # Convert the query into the TF-IDF space and then apply SVD to project it into the LSA space
    query_tfidf = tfidf_vectorizer.transform([query])
    query_lsa = svd.transform(query_tfidf)

    # Compute cosine similarities between the query and all the documents
    similarities = cosine_similarity(query_lsa, lsa_matrix)[0]

    # Get the top 5 most similar documents (highest cosine similarities)
    top_indices = np.argsort(similarities)[-5:][::-1]  # Get the indices of the top 5 documents
    top_scores = similarities[top_indices]  # Get the cosine similarity scores of those top 5
    top_docs = [newsgroups_data[i] for i in top_indices]  # Retrieve the actual documents

    # Return results as JSON to the frontend
    return jsonify({
        'documents': top_docs,
        'scores': top_scores.tolist()
    })

if __name__ == '__main__':
    app.run(debug=True, port=3000)
