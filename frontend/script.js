document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('predict-form');
    const tickerInput = document.getElementById('ticker-input');
    const analyzeBtn = document.getElementById('analyze-btn');
    const btnText = analyzeBtn.querySelector('.btn-text');
    const loader = analyzeBtn.querySelector('.loader');
    const errorMsg = document.getElementById('error-message');
    const dashboard = document.getElementById('dashboard');
    
    // UI elements setup
    const currentPriceEl = document.getElementById('current-price');
    const predictedPriceEl = document.getElementById('predicted-price');
    const smaVal = document.getElementById('sma-val');
    const emaVal = document.getElementById('ema-val');
    const rsiVal = document.getElementById('rsi-val');
    
    let predictionChart = null;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const ticker = tickerInput.value.trim().toUpperCase();
        if (!ticker) return;

        // Reset UI State
        dashboard.style.display = 'none';
        errorMsg.style.display = 'none';
        btnText.style.display = 'none';
        loader.style.display = 'block';
        analyzeBtn.disabled = true;

        try {
            const response = await fetch('http://127.0.0.1:5000/api/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ticker })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch prediction');
            }

            // Populate Data
            currentPriceEl.textContent = data.current_price ? `₹${data.current_price}` : 'N/A';
            predictedPriceEl.textContent = `₹${data.prediction}`;
            
            smaVal.textContent = data.indicators.SMA_50;
            emaVal.textContent = data.indicators.EMA_20;
            
            // Color code RSI
            const rsi = data.indicators.RSI;
            rsiVal.textContent = rsi;
            if (rsi > 70) rsiVal.style.color = '#ff4b4b'; // Overbought
            else if (rsi < 30) rsiVal.style.color = '#66fcf1'; // Oversold
            else rsiVal.style.color = '#ffffff'; // Neutral

            // Render Chart with real historical data
            renderChart(data.history.dates, data.history.prices, ticker);

            dashboard.style.display = 'flex';
        } catch (error) {
            errorMsg.textContent = error.message;
            errorMsg.style.display = 'block';
        } finally {
            btnText.style.display = 'block';
            loader.style.display = 'none';
            analyzeBtn.disabled = false;
        }
    });

    function renderChart(dates, prices, ticker) {
        const ctx = document.getElementById('predictionChart').getContext('2d');
        
        if (predictionChart) {
            predictionChart.destroy();
        }

        // Configure colors -> prediction gets a special point color
        const pointColors = prices.map((_, i) => i === prices.length - 1 ? '#ffeb3b' : '#ffffff');
        const pointBorderColors = prices.map((_, i) => i === prices.length - 1 ? '#ffc107' : '#66fcf1');
        const pointRadii = prices.map((_, i) => i === prices.length - 1 ? 8 : 4);
        
        predictionChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: `${ticker} Price History & Prediction`,
                    data: prices,
                    borderColor: '#66fcf1',
                    backgroundColor: 'rgba(102, 252, 241, 0.1)',
                    borderWidth: 2,
                    pointBackgroundColor: pointColors,
                    pointBorderColor: pointBorderColors,
                    pointRadius: pointRadii,
                    pointHoverRadius: 8,
                    fill: true,
                    tension: 0.2 // Slight smooth curves
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: '#c5c6c7',
                            font: { family: "'Inter', sans-serif" }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.parsed.y !== null) {
                                    label += '₹' + context.parsed.y;
                                }
                                if (context.dataIndex === context.dataset.data.length - 1) {
                                     label += ' (Predicted)';
                                }
                                return label;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        grid: { color: 'rgba(255, 255, 255, 0.05)' },
                        ticks: { color: '#c5c6c7', font: { family: "'Roboto Mono', monospace" } }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { 
                            color: '#c5c6c7', 
                            font: { family: "'Inter', sans-serif", size: 10 },
                            maxTicksLimit: 8
                        }
                    }
                }
            }
        });
    }
});
