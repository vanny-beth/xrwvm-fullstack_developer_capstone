# Uncomment the required imports before adding the code

from django.shortcuts import render
import requests
from django.http import HttpResponseRedirect, HttpResponse, JsonResponse
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404, redirect
from django.contrib.auth import logout, login, authenticate
from django.contrib import messages
from datetime import datetime
from .models import CarMake, CarModel
from .restapis import analyze_review_sentiments
import logging
import json
from django.views.decorators.csrf import csrf_exempt
from .populate import initiate


# Get an instance of a logger
logger = logging.getLogger(__name__)

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
    except:
        logger.debug(f"{username} is a new user")

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
        return JsonResponse({"userName": username, "error": "Already Registered"})

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
def get_dealerships(request, state=None):
    endpoint = "/fetchDealers"
    params = {}

    if state and state != "All":
        params["state"] = state

    dealerships = get_request(endpoint, params=params)
    return JsonResponse({"status": 200, "dealers": dealerships})

# Create a `get_dealer_reviews` view to render the reviews of a dealer
def get_dealer_reviews(request, dealer_id):
    if dealer_id:
        endpoint = "/fetchReviews/dealer/" + str(dealer_id)
        reviews = get_request(endpoint)
        for review_detail in reviews:
            response = analyze_review_sentiments(review_detail['review'])
            review_detail['sentiment'] = response['sentiment']
        return JsonResponse({"status": 200, "reviews": reviews})
    else:
        return JsonResponse({"status": 400, "message": "Bad Request"})

# Create a `get_dealer_details` view to render the dealer details
def get_dealer_details(request, dealer_id):
    if dealer_id:
        endpoint = "/fetchDealer/" + str(dealer_id)
        dealership = get_request(endpoint)

        if isinstance(dealership, dict) and "id" in dealership:
            return JsonResponse({"status": 200, "dealer": dealership})

        return JsonResponse({"status": 404, "message": f"No dealer found with ID {dealer_id}"})
    else:
        return JsonResponse({"status": 400, "message": "Bad Request"})

# Create a `add_review` view to submit a review
@csrf_exempt
def add_review(request):
    if request.method == "POST":
        data = json.loads(request.body)
        try:
            response = post_review(data)
            return JsonResponse(response)
        except Exception as e:
            print("Error in posting review:", e)
            return JsonResponse({"status": 401, "message": "Error in posting review"})
    else:
        return JsonResponse({"status": 405, "message": "Method not allowed"})
        
def post_review_page(request, dealer_id):
    return render(request, "index.html")  # Or a dedicated review form template

def post_review(data):
    try:
        print("Received review data:", data)
        reviews_collection.insert_one(data)   # 👈 actually save to MongoDB
        return {"status": 200, "message": "Review saved"}
    except Exception as e:
        print("Error inserting review:", e)
        return {"status": 500, "message": "Error saving review"}
