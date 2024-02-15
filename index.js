const moviesLimit = 30;
const tmdbImageUrl = "https://image.tmdb.org/t/p/original";
const IDGenreMap = new Map();
const GenreIDMap = new Map();

const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: "YOUR TMDB AUTHORIZATION",
  },
};

const Container = document.querySelector(".main-content");
function createMovieDetailsElement(imageSrc, movieRating, movieTitle, genre) {
  // Create the movie-details container
  const movieDetailsContainer = document.createElement("div");
  movieDetailsContainer.classList.add("movie-details");

  // Create the movie image
  console.log(imageSrc);
  if (!imageSrc.includes("null")) {
    const movieImage = document.createElement("img");
    movieImage.src = imageSrc;
    movieImage.alt = "Poster";
    movieImage.classList.add("movie-image");
    movieDetailsContainer.appendChild(movieImage);
  }

  // Create the details-container
  const detailsContainer = document.createElement("div");
  detailsContainer.classList.add("details-container");
  movieDetailsContainer.appendChild(detailsContainer);

  // Create the movie genre container
  const movieGenreContainer = document.createElement("div");
  movieGenreContainer.classList.add("movie-genre");
  detailsContainer.appendChild(movieGenreContainer);

  // Create the genre paragraph
  const genreParagraph = document.createElement("p");
  genreParagraph.classList.add("genre");
  genreParagraph.textContent = genre;
  movieGenreContainer.appendChild(genreParagraph);

  // Create the movie rating paragraph
  const movieRatingParagraph = document.createElement("p");
  movieRatingParagraph.classList.add("movie-rating");
  movieRatingParagraph.textContent = movieRating + "/10";
  detailsContainer.appendChild(movieRatingParagraph);

  // Create the movie title paragraph
  const movieTitleParagraph = document.createElement("p");
  movieTitleParagraph.classList.add("movie-title");
  movieTitleParagraph.textContent = movieTitle;
  detailsContainer.appendChild(movieTitleParagraph);

  return movieDetailsContainer;
}

async function fetchGenres() {
  try {
    const response = await fetch(
      "https://api.themoviedb.org/3/genre/movie/list?language=en",
      options
    );
    const data = await response.json();
    console.log(data);
    const list = data.genres;

    for (const { id, name } of list) {
      IDGenreMap.set(id, name);
      GenreIDMap.set(name, id);
    }
  } catch (err) {
    Container.innerHTML = "";
    Container.innerHTML += "<div>Something Went Wrong</div>";
  }
}

async function handleMovieSearch() {
  Container.innerHTML = "";
  Container.innerHTML = `<div class="topic" >Loading...</div>`;
  const input = document.getElementById("movieQuery");
  const movie = input.value;
  try {
    await fetchGenres();
    const respone = await fetch(
      `https://api.themoviedb.org/3/search/movie?query=${movie}&include_adult=false&language=en-US&page=1`,
      options
    );

    var data = await respone.json();
    var moviesList = data.results;

    if (moviesList.length > moviesLimit) {
      moviesLimit.splice(moviesList.length - moviesLimit, moviesLimit);
    }
    Container.innerHTML = "";
    // if no movies there then try getting by genre
    if (moviesList.length == 0 && GenreIDMap.has(movie)) {
      const newResponse = await fetch(
        `https://api.themoviedb.org/3/list/${GenreIDMap.get(movie)}`,
        options
      );
      data = await respone.json();
      moviesList = data.results;

      if (moviesList.length > moviesLimit) {
        moviesLimit.splice(moviesList.length - moviesLimit, moviesLimit);
      }
    }
    if (moviesList.length) {
      for (const {
        poster_path,
        original_title,
        vote_average,
        genre_ids,
      } of moviesList) {
        const movieCard = createMovieDetailsElement(
          tmdbImageUrl + poster_path,
          vote_average,
          original_title,
          genre_ids.length ? IDGenreMap.get(genre_ids[0]) : "No genre specified"
        );
        if (poster_path == null) {
          movieCard.style.backgroundColor = "#000";
        }
        Container.append(movieCard);
      }
    } else {
      Container.innerHTML += `<div class="movie-details" >No Results found.Try entering a different movie name. </div>`;
    }
    const topics = document.querySelectorAll(".topic");
    // Remove the "selected" class from all topic divs
    topics.forEach((topic) => {
      topic.classList.remove("selected");
    });
    //Add it to search one
    const searchResult = document.querySelector("#selected");
    searchResult.classList.add("selected");
  } catch (err) {
    Container.innerHTML = "";
    Container.innerHTML += `<div class="movie-details" >Something went wrong.Try again later. </div>`;
  }
}

async function handleGenre(genre) {
  Container.innerHTML = "";
  Container.innerHTML = `<div class="topic" >Loading...</div>`;
  try {
    const respone = await fetch(
      `https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc&with_genres=${GenreIDMap.get(
        genre
      )}`,
      options
    );

    const data = await respone.json();
    const moviesList = data.results;
    Container.innerHTML = "";

    if (moviesList.length) {
      for (const {
        poster_path,
        original_title,
        vote_average,
        genre_ids,
      } of moviesList) {
        const movieCard = createMovieDetailsElement(
          tmdbImageUrl + poster_path,
          vote_average,
          original_title,
          genre_ids.length ? IDGenreMap.get(genre_ids[0]) : "No genre specified"
        );
        if (poster_path == null) {
          movieCard.style.backgroundColor = "#000";
        }
        Container.append(movieCard);
      }
    } else {
      Container.innerHTML += `<div class="movie-details" >No results found. </div>`;
    }
  } catch (err) {
    Container.innerHTML = "";
    Container.innerHTML += `<div class="movie-details" >Something went wrong.Try again later. </div>`;
  }
}

const fetchData = async () => {
  try {
    await fetchGenres();
    // Get all the topic div elements
    const sideBar = document.querySelector(".sidebar");
    for (const [id, genre] of IDGenreMap) {
      const div = document.createElement("div");
      div.classList.add("topic");
      div.innerHTML += genre;
      sideBar.append(div);
    }
    const topics = document.querySelectorAll(".topic");

    // Add click event listener to each topic div
    topics.forEach((topic) => {
      topic.addEventListener("click", async function () {
        // Remove the "selected" class from all topic divs
        topics.forEach((topic) => {
          topic.classList.remove("selected");
        });

        // Add the "selected" class to the clicked topic div
        this.classList.add("selected");

        // Retrieve the text content of the clicked topic div
        const topicText = this.textContent;
        console.log(topicText);
        if (topicText == "Search Results") {
          await handleMovieSearch(topicText);
        } else {
          await handleGenre(topicText);
        }
      });
    });
  } catch (err) {
    Container.innerHTML = "";
    Container.innerHTML += "<div>Something Went Wrong</div>";
  }
};

fetchData();
