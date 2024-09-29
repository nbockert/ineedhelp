

let isManual = false;
let selectedCentroids = [];
let k = 0;
// Function to send selected centroids to the backend
function displayMessage(message) {
    document.getElementById('output').innerText = message;
}

// Event listener for button click
let clusterPlot = document.getElementById('clusterPlot');
    clusterPlot.on('plotly_click', function(data) {
    // Call the Flask endpoint

});
function sendCentroid(x, y) {
    fetch('/add_centroid', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ x: x, y: y })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'ok') {
            updatePlot(data.image_url);
        }
    });
}

// Plot initial data and allow interaction
function plotData(dataX, dataY,data) {
    k = parseInt(document.getElementById("num_clusters").value);
    let trace = {
        x: dataX,
        y: dataY,
        mode: 'markers',
        type: 'scatter',
        marker: { color: 'blue' }
    };
    let centroidTrace = {
        x: selectedCentroids.map(c => c[0]),
        y: selectedCentroids.map(c => c[1]),
        mode: 'markers',
        type: 'scatter',
        marker: { color: 'red', symbol: 'x', size: 12 }
    };

  
    let layout = {
        title: 'Select Initial Centroids by Clicking',
        clickmode: 'event+select'
    };

    Plotly.newPlot('clusterPlot', [trace, centroidTrace], layout);
    let count = 0
    // while(count<=k){
    let clusterPlot = document.getElementById('clusterPlot');
    clusterPlot.on('plotly_click', function(data) {
        let x = data.points[0].x;
        let y = data.points[0].y;
        selectedCentroids.push([x, y]);

        updateCentroidPlot(dataX, dataY);

        fetch('/some_endpoint')
        .then(response => response.json())
        .then(data => {
            // Call the JavaScript function with the received data
            plotData(data.dataX,data.dataY,data.data);
        })
        .catch(error => console.error('Error fetching data:', error));
        
        // If we've selected enough centroids, send them to the server
     
    });
}

// Function to update the plot with selected centroids
function updateCentroidPlot(dataX, dataY) {
    // print("selected centroids:", selectedCentroids)
    // Clear the existing plot
    Plotly.purge('clusterPlot');


    let trace = {
        x: dataX,
        y: dataY,
        mode: 'markers',
        type: 'scatter',
        marker: { color: 'blue' }
    };
    // selectedCentroids.map(c => c[0])
    let centroidTrace = {
        x: selectedCentroids.map(c => c[0]),
        y: selectedCentroids.map(c => c[1]),
        mode: 'markers',
        type: 'scatter',
        marker: { color: 'red', symbol: 'x', size: 12 }
    };

    Plotly.newPlot('clusterPlot', [trace, centroidTrace], {
        title: 'Select Initial Centroids by Clicking',
        clickmode: 'event+select'
    });
    sendCentroids(selectedCentroids.map(c => c[0]),selectedCentroids.map(c => c[1])); 
}

// Function to update the plot with the selected centroids
function updatePlot(imageUrl) {
    document.getElementById('cluster_image').src = imageUrl;
}

// When the user selects "Manual"
function onInitMethodChange() {
    let method = document.getElementById('init_method').value;
    if (method === 'manual') {
        k = parseInt(document.getElementById("num_clusters").value);
        isManual = true;

        // Fetch data for the plot and render it
        fetch('/get_data')
            .then(response => response.json())
            .then(data => {
                plotData(data.dataX, data.dataY,data);
            });
    } else {
        isManual = false;
        k = parseInt(document.getElementById("num_clusters").value);

        // Send a POST request to the Flask server with k and initMethod
        fetch('/start_clustering', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                num_clusters: k,
                init_method: method
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);  // Use this to debug
            // Display the result image or other output based on the result
            if (data.snap_file) {
                document.getElementById('cluster_image').src = data.snap_file;
            }
        })
        .catch(error => console.error('Error:', error));
    }
}
