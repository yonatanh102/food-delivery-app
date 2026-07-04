# food-delivery-app
...

# to run the recommendation system:
docker build -t recommendation-server .
docker run -it --rm recommendation-server

# to run the recommendation system tests:
docker build -t recommendation-server .
docker run -it --rm recommendation-server ./build/run_tests