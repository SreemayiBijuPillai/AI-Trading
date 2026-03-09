from utils.data_fetcher import get_stock_data
from utils.indicators import add_indicators

# Get stock data
data = get_stock_data("RELIANCE.NS")

# Add indicators
data = add_indicators(data)

# Show last rows
print(data.tail())