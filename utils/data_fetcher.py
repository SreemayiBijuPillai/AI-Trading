import yfinance as yf

def get_stock_data(ticker):
    # Download stock data for 1 year
    data = yf.download(ticker, period="1y")

    return data