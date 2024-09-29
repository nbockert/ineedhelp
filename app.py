from flask import Flask, render_template, request, jsonify, send_file
from kmeans_init_methods import KMeans  # Import your KMeans class
import numpy as np
import sklearn.datasets as datasets
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt


app = Flask(__name__)

# Global variables for centroids and KMeans object
selected_centroids = []
kmeans = None

# Example data for clustering
centers = [[0, 0], [2, 2], [-3, 2], [2, -4]]
X, _ = datasets.make_blobs(n_samples=300, centers=centers, cluster_std=1, random_state=0)

@app.route('/')
def index():
    TEMPFILE = "static/snapinit.png"  # Ensure the image is saved in the static directory

    # Create the plot
    fig, ax = plt.subplots()
    print("made it here")
    ax.scatter(X[:, 0], X[:, 1])
    ax.set_title("Data Points")
    fig.savefig(TEMPFILE)
    plt.close()

    return render_template('index.html', snap_init="snapinit.png")


# Route to return data for Plotly.js plot
@app.route('/get_data', methods=['GET'])
def get_data():
    dataX = X[:, 0].tolist()
    dataY = X[:, 1].tolist()
    return jsonify({'dataX': dataX, 'dataY': dataY})

@app.route('/start_clustering', methods=['POST'])
def start_clustering():
    init_method = request.json.get('init_method')
    k = request.json.get("num_clusters")
    kmeans = KMeans(X, k)
    centroids = kmeans.initialize(init_method)
    
    # Perform clustering and return the results
    kmeans.make_clusters(centroids)
    return render_template('index.html', centroids=centroids)

@app.route('/add_centroids', methods=['POST'])
def add_centroids():
    print("at add centroid")
    k = request.json.get("num_clusters")
    global selected_centroids, kmeans
    
    data = request.json
    selected_centroids.append([data['x'],data['y']])

    # If you have `k` as a global variable or passed from the frontend
    if len(selected_centroids) == k:  # Ensure `k` is defined globally or passed
        kmeans = KMeans(X, k)
        kmeans.lloyds('manual', selected_centroids)

        # Send back the final cluster image
        image_path = update_plot_with_clusters(kmeans.centers)
        return jsonify({'status': 'done', 'image_url': image_path})
    else:
        some_endpoint()

    # Otherwise, continue the process of selecting centroids
    return jsonify({'status': 'ok'})

@app.route('/some_endpoint', methods=['GET'])
def some_endpoint():
    print("in some_endpoint")
    # Do some processing and return a response
    dataX = X[:, 0].tolist()
    dataY = X[:, 1].tolist()
    return jsonify({'dataX': dataX, 'dataY': dataY,"data":X})
    


def update_plot_with_clusters(centroids):
    TEMPFILE = "final_clusters_plot.png"
    fig, ax = plt.subplots()
    ax.scatter(X[:, 0], X[:, 1])
    for center in centroids:
        ax.scatter(center[0], center[1], c='g', marker='X')
    fig.savefig(TEMPFILE)
    plt.close()
    return TEMPFILE

if __name__ == '__main__':
    app.run(port=5000, debug=True)