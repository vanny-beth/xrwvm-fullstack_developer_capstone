# Uncomment the required imports before adding the code

from django.shortcuts import render
import requests
from django.http import JsonResponse
from django.contrib.auth.models import User
from django.contrib.auth import logout, login, authenticate
from .models import CarMake, CarModel
from .restapis import get_request, analyze_review_sentiments, post_review
import logging
import json
from django.views.decorators.csrf import csrf_exempt
from .populate import initiate
from pymongo import MongoClient


# Get an instance of a logger
logger = logging.getLogger(__name__)

mongo_client = MongoClient("mongodb://localhost:27017/")
reviews_collection = mongo_client["dealerships"]["reviews"]
# Create your views here.

# Create a `login_request` view to handle sign in request


@csrf_exempt
def login_user(request):
    data = json.loads(request.body)
    username = data['userName']
    password = data['password']
    user = authenticate(username=username, password=password)
    data = {"userName": username}
    if user is not None:
        login(request, user)
        data = {"userName": username, "status": "Authenticated"}
    return JsonResponse(data)


def logout_request(request):
    logout(request)
    return JsonResponse({"message": "Logged out successfully"})


@csrf_exempt
def registration(request):
    data = json.loads(request.body)
    username = data['userName']
    password = data['password']
    first_name = data['firstName']
    last_name = data['lastName']
    email = data['email']
    username_exist = False

    try:
        User.objects.get(username=username)
        username_exist = True
    except Exception as e:
        logger.debug(f"{username} is a new user: {e}")

    if not username_exist:
        user = User.objects.create_user(
            username=username,
            first_name=first_name,
            last_name=last_name,
            password=password,
            email=email
        )
        login(request, user)
        return JsonResponse({"userName": username, "status": "Authenticated"})
    else:
        return JsonResponse({
            "userName": username,
            "error": "Already Registered"
        })


def get_cars(request):
    count = CarMake.objects.filter().count()
    if count == 0:
        initiate()
    car_models = CarModel.objects.select_related('car_make')
    cars = []
    for car_model in car_models:
        cars.append({
            "CarModel": car_model.name,
            "CarMake": car_model.car_make.name
        })
    return JsonResponse({"CarModels": cars})

# Utility to call Express microservice


def get_request(endpoint, params=None):
    url = "http://localhost:3030" + endpoint
    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        data = response.json()

        if isinstance(data, dict) and "dealers" in data:
            return data["dealers"]
        if isinstance(data, list):
            return data
        return []
    except requests.exceptions.RequestException as e:
        print("Error fetching dealers:", e)
        return []

# Fetch dealerships (all or by state)


# Update the `get_dealerships` render list of dealerships all by default, particular state if state is passed

def get_dealerships(request, state="All"):
    if(state == "All"):
        endpoint = "/fetchDealers"
    else:
        endpoint = "/fetchDealers/"+state
    dealerships = get_request(endpoint)
    return JsonResponse({"status":200,"dealers":dealerships})

# Create a `get_dealer_reviews` view to render the reviews of a dealer


from django.http import JsonResponse

def get_dealer_reviews(request, dealer_id):
    try:
        reviews = list(reviews_collection.find({"dealership": int(dealer_id)}))
        for r in reviews:
            r["_id"] = str(r["_id"])  # convert ObjectId to string
        return JsonResponse({"reviews": reviews})
    except Exception as e:
        return JsonResponse({"status": 500, "message": str(e)})


# Create a `get_dealer_details` view to render the dealer details


def get_dealer_details(request, dealer_id):
    if(dealer_id):
        endpoint = "/fetchDealer/"+str(dealer_id)
        dealership = get_request(endpoint)
        return JsonResponse({"status":200,"dealer":dealership})
    else:
        return JsonResponse({"status":400,"message":"Bad Request"})


# Create a `add_review` view to submit a review


@csrf_exempt
def add_review(request):
    try:
        data = json.loads(request.body)
        print("Received review:", data)

        # Call your review handler
        response = post_review(data)

        return JsonResponse({"status": 200, "message": "Review posted successfully"})
    except Exception as e:
        print("Error in add_review:", str(e))
        return JsonResponse({"status": 500, "message": str(e)})


def post_review_page(request, dealer_id):
    return render(request, "index.html")  # Or a dedicated review form template


def post_review(data):
    try:
        print("Received review data:", data)
        reviews_collection.insert_one(data)
        return {"status": 200, "message": "Review saved"}
    except Exception as e:
        print("Error inserting review:", e)
        return {"status": 500, "message": "Error saving review"}
