async function classes(url) {

  await fetch(url).then(function (response) {
    return response.json();
  }).then(function (data) {
    console.log(data);
  }).catch(function () {
    console.log("Error");
  });

  console.log(`Systems Programming, Computer Science Theory, Algorithms, Privacy and Security`)

  // Also Men's DIII Lacrosse
}