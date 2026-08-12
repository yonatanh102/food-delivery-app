
cmake_minimum_required(VERSION 3.14)

project(RecommendationApp)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

file(GLOB ALL_SOURCES "Recommendation/src/*.cpp")

list(REMOVE_ITEM ALL_SOURCES "${CMAKE_SOURCE_DIR}/Recommendation/src/Main.cpp")

add_executable(recommend_app ${ALL_SOURCES} Recommendation/src/Main.cpp)
target_include_directories(recommend_app PRIVATE ${CMAKE_SOURCE_DIR}/Recommendation/include)

# --- (Google Test) ---

include(FetchContent)
FetchContent_Declare(
  googletest
  GIT_REPOSITORY https://github.com/google/googletest.git
  GIT_TAG release-1.12.1
)
FetchContent_MakeAvailable(googletest)

file(GLOB TEST_SOURCES "Recommendation/tests/*.cpp")

add_executable(run_tests ${TEST_SOURCES} ${ALL_SOURCES})
target_include_directories(run_tests PRIVATE ${CMAKE_SOURCE_DIR}/Recommendation/include)

target_link_libraries(run_tests gtest_main)