import pandas as pd

def add_indicators(df):

    # Simple Moving Average (50 days)
    df['SMA_50'] = df['Close'].rolling(window=50).mean()

    # Exponential Moving Average (20 days)
    df['EMA_20'] = df['Close'].ewm(span=20, adjust=False).mean()

    # RSI Calculation
    delta = df['Close'].diff()

    gain = delta.clip(lower=0)
    loss = -delta.clip(upper=0)

    avg_gain = gain.rolling(window=14).mean()
    avg_loss = loss.rolling(window=14).mean()

    rs = avg_gain / avg_loss

    df['RSI'] = 100 - (100 / (1 + rs))

    return df