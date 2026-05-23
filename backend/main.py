from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import os



BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Load the model safely
model_path = os.path.join(BASE_DIR, "models", "rf_random.pkl")
model = joblib.load(model_path)


app = FastAPI()

# ✅ Routes
@app.get("/")
def home():
    return {"message": "Hello, Your API is successfully deployed and live."}

# ✅ Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://fair-prediction.onrender.com"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Input schema for prediction
class FlightInput(BaseModel):
    airline: str
    source: str
    destination: str
    stops: int
    day: int
    month: int
    hour: int
    minute: int
    arrival_hour: int
    arrival_minute: int

airlines = ['Trujet', 'SpiceJet', 'Air Asia', 'IndiGo', 'GoAir', 'Vistara',
       'Vistara Premium economy', 'Air India', 'Multiple carriers',
       'Multiple carriers Premium economy', 'Jet Airways',
       'Jet Airways Business']
sources = ['Banglore', 'Kolkata', 'Delhi', 'Chennai', 'Mumbai']
destinations = ['Kolkata', 'Hyderabad', 'Delhi', 'Banglore', 'Cochin']
dict_airlines = {key: index for index, key in enumerate(airlines, 0)}
dict_dest = {key: index for index, key in enumerate(destinations, 0)}

@app.post("/predict")
def predict(data: FlightInput):
    try:
        #  Encode Airline and Destination
        airline_code = dict_airlines.get(data.airline, 0)
        destination_code = dict_dest.get(data.destination, 0)

        #  Compute duration
        duration_hour = abs(data.arrival_hour - data.hour)
        duration_min = abs(data.arrival_minute - data.minute)

        # Create feature vector in exact order of training columns
        features = [
            airline_code,                     # Airline
            destination_code,                 # Destination
            data.stops,                       # Total_Stops
            data.day,                         # journey_day
            data.month,                       # journey_month
            data.hour,                        # Dep_Time_hour
            data.minute,                      # Dep_Time_minute
            data.arrival_hour,                # Arrival_Time_hour
            data.arrival_minute,              # Arrival_Time_minute
            duration_hour,                    # Duration_hours
            duration_min                      # Duration_mins
        ]

        # 4️⃣ One-hot encode source (Banglore, Kolkata, Delhi, Chennai, Mumbai)
        sources = ["Banglore", "Kolkata", "Delhi", "Chennai", "Mumbai"]
        for src in sources:
            features.append(1 if data.source == src else 0)

        # 5️⃣ Predict
        prediction = model.predict([features])
        return {"predicted_fare": float(prediction[0])}

    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"error": str(e)}



