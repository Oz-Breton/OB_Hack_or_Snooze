"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();
  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story, own = false) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();

  return $(`
      <li id="${story.storyId}">
        ${own ? '<span class = "trash can"><i class = "fas fa-trash-alt"></i> </span>': ''}
        <span class = 'star'> <i class = 'far fa-star'></i></span>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage(stories = storyList.stories) {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of stories) {
    let own = false;
    if (currentUser && !currentUser.ownStories.every(st => st.storyId !== story.storyId)){
      own = true;
    }
    const $story = generateStoryMarkup(story, own);
    $allStoriesList.append($story);
    if (currentUser && !currentUser.favorites.every(f => f.storyId !== story.storyId)){
      $(`#${story.storyId} span i`).toggleClass(['far', 'fas']);
    }
  }

  $allStoriesList.show();
}

async function submitStory (e){
  e.preventDefault();
  const [author, title, url] = [$('#submit-author').val(), $('#submit-title').val(), $('#submit-url').val()]
  const newStory = await storyList.addStory(currentUser, {title, author, url});
  storyList.stories.unshift(newStory);
  currentUser.ownStories.push(newStory);
  $('#submit-form').hide();
  navAllStories();
  page = 'story'
  putStoriesOnPage();
}

$('#submit-form').on('submit', submitStory);

async function removeOwnClick(e){
  const id = e.target.parentElement.parentElement.id;
  await storyList.deleteStory(currentUser, id);
  hidePageComponents();
  switch (page){
    case 'story':
      putStoriesOnPage();
      break;
    case 'favorite':
      putStoriesOnPage(currentUser.favorites);
      break;
    case 'own':
      putStoriesOnPage(currentUser.ownStories);
      break;
  }
}

$allStoriesList.on('click', '.fa-trash-alt', removeOwnClick);

