# food-delivery-app
...

# to run the recommendation system:
docker build -t recommendation-server .
docker run -it --rm recommendation-server

# to run the recommendation system tests:
docker build --target builder -t recommendation-tester .
docker run -it --rm recommendation-tester ./build/run_tests