// Function to handle the search query
function performSearch() {
  const query = document.getElementById('query').value;

  // Clear previous results before performing a new search
  clearPreviousResults();

  // Send the search query to the backend using fetch
  fetch('/search', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `query=${encodeURIComponent(query)}`
  })
  .then(response => response.json())
  .then(data => {
      // Display the results and cosine similarity chart
      displayResults(data.documents, data.scores);

      // Scroll to the top of the results after rendering
      scrollToTopOfResults();
  });
}

// Function to clear previous results
function clearPreviousResults() {
  const resultsDiv = document.getElementById('documents');
  resultsDiv.innerHTML = '';  // Remove previous documents

  const chartSection = document.getElementById('cosineChart');
  if (chartSection) {
      chartSection.innerHTML = '';  // Remove the previous chart
  }
}

// Function to scroll to the top of the results section
function scrollToTopOfResults() {
  const resultsSection = document.getElementById('results');
  resultsSection.scrollIntoView({ behavior: 'smooth' }); // Scroll to the results section smoothly
}

// Function to display the search results
function displayResults(documents, scores) {
  const resultsDiv = document.getElementById('documents');

  // Display each of the top 5 documents
  documents.forEach((doc, index) => {
      const docElement = document.createElement('div');
      docElement.classList.add('document');
      docElement.innerHTML = `<p><strong>Document ${index + 1}</strong>: ${doc}</p>`;
      resultsDiv.appendChild(docElement);
  });

  // Generate the cosine similarity chart using Plotly
  drawCosineChart(scores);
}

// Function to draw the cosine similarity chart using Plotly
function drawCosineChart(scores) {
  const data = [{
      x: ['Doc 1', 'Doc 2', 'Doc 3', 'Doc 4', 'Doc 5'], // X-axis labels
      y: scores, // Y-axis values (cosine similarity scores)
      type: 'bar', // Bar chart
      marker: {
          color: 'rgba(54, 162, 235, 0.7)', // Custom color for bars
          line: {
              color: 'rgba(54, 162, 235, 1)', // Border color for bars
              width: 1
          }
      }
  }];

  const layout = {
      title: 'Cosine Similarity Scores of Top 5 Documents',
      xaxis: { title: 'Top 5 Documents' },
      yaxis: { title: 'Cosine Similarity', range: [0, 1] }
  };

  Plotly.newPlot('cosineChart', data, layout);
}
