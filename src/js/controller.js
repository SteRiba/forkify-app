import * as model from './model.js';
import { RELOAD_PAGE_TIMER } from './config.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarkView from './views/bookmarkView.js';
import addRecipeView from './views/addRecipeView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';

// if (module.hot) {
//   module.hot.accept();
// }

const controlRecipe = async function () {
  try {
    // 1) Get id recipe
    const id = window.location.hash.slice(1);
    if (!id) return;

    recipeView.renderSpinner();

    // Updates views
    resultsView.update(model.renderResultsPerPage());
    bookmarkView.update(model.state.bookmarks);

    // 2) Load recipe
    await model.loadRecipe(id);

    // 3) Rendering recipe
    recipeView.render(model.state.recipe);

    // setTimeout(() => addRecipeView.toggleWindow(), CLOSE_MODAL_WIN * 1000);
  } catch (error) {
    recipeView.renderError();
  }
};

const controlSearchResult = async function () {
  try {
    resultsView.renderSpinner();

    // 1) Get search query
    const query = searchView.getQuery();
    if (!query) return;

    // 2) Load search results
    await model.loadSearchResult(query);

    // 3) Render results
    resultsView.render(model.renderResultsPerPage());

    // 4) Render initial pagination button
    paginationView.render(model.state.search);
  } catch (error) {
    console.log(error);
  }
};

const controlPagination = function (goToPage) {
  // 1) Render NEW results
  resultsView.render(model.renderResultsPerPage(goToPage));

  // 2) Render NEW pagination button
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  // 1) Updates servings
  model.updateServings(newServings);

  // 2) Render updated servings
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  // 1) Adds or removes bookmark
  model.toggleBookmark(model.state.recipe);
  // console.log(model.state.recipe);

  // 2) Render bookmark icon
  recipeView.update(model.state.recipe);

  bookmarkView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarkView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    addRecipeView.renderSpinner();

    // 1) Upload the new recepe data
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    // 2) Render recepe
    recipeView.render(model.state.recipe);

    // 3) Display success message
    addRecipeView.renderMessage();

    // 4) Render bookmark view
    bookmarkView.render(model.state.bookmarks);

    // 5) Change ID in URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    setTimeout(() => location.reload(), RELOAD_PAGE_TIMER * 1000);
  } catch (error) {
    addRecipeView.renderError(error.message);
  }
};

const init = function () {
  bookmarkView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerEvent(controlRecipe);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResult);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};

init();
