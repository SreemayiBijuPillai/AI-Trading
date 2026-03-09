import pandas as pd
from sklearn.ensemble import RandomForestRegressor
import joblib

from utils.data_fetcher import get_stock_data
from utils.indicators import add_indicators


def train():

    # Fetch stock data
    data = get_stock_data("RELIANCE.NS")

    # Add indicators
    data = add_indicators(data)

    # Remove missing values
    data = data.dropna()

    # Features (inputs for AI)
    X = data[['SMA_50', 'EMA_20', 'RSI']]

    # Target (what we want to predict)
    y = data['Close']

    # Train model
    model = RandomForestRegressor()

    model.fit(X, y)

    # Save model
    joblib.dump(model, "models/stock_model.pkl")

    print("Model trained and saved!")


if __name__ == "__main__":
    train()