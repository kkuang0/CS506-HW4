document.getElementById('search-form').addEventListener('submit', function (event) {
    event.preventDefault();
    
    let query = document.getElementById('query').value.trim();
    if (!query) {
        alert("Please enter a search query.");
        return;
    }

    let resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '<p>Loading results...</p>';

    fetch('/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            'query': query
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        resultsDiv.innerHTML = ''; // Clear the loading text
        displayResults(data);
        displayChart(data);
    })
    .catch(error => {
        console.error('Error:', error);
        resultsDiv.innerHTML = '<p>An error occurred while processing your request.</p>';
    });
});

function displayResults(data) {
    let resultsDiv = document.getElementById('results');
    if (data.documents.length === 0) {
        resultsDiv.innerHTML = '<h2>Results</h2><p>No documents found.</p>';
        return;
    }

    resultsDiv.innerHTML = '<h2>Results</h2>';
    for (let i = 0; i < data.documents.length; i++) {
        let docDiv = document.createElement('div');
        docDiv.classList.add('document');
        docDiv.innerHTML = `
            <strong>Document ${data.indices[i]}</strong>
            <p>${truncateText(data.documents[i], 500)}</p>
            <br>
            <strong>Similarity: ${data.similarities[i].toFixed(4)}</strong>
            <hr>
        `;
        resultsDiv.appendChild(docDiv);
    }
}

function displayChart(data) {
    let ctx = document.getElementById('similarity-chart').getContext('2d');
    
    // Clear previous chart instance if any
    if (window.myChart instanceof Chart) {
        window.myChart.destroy();
    }

    // Create the chart
    window.myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.indices.map(index => `Document ${index}`),
            datasets: [{
                label: 'Similarity Score',
                data: data.similarities,
                backgroundColor: 'rgba(75, 192, 192, 0.2)', // Semi-transparent teal
                borderColor: 'rgba(75, 192, 192, 1)', // Solid teal
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Similarity'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Document'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false // Hide legend since there's only one dataset
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Similarity: ${context.parsed.y.toFixed(4)}`;
                        }
                    }
                }
            }
        }
    });
}

// Optional: Function to truncate long documents for better readability
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}
