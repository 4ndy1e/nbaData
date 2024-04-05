const options = {
  method: 'GET',
  headers: {
    'X-RapidAPI-Key': 'api-key',
    'X-RapidAPI-Host': 'api-nba-v1.p.rapidapi.com'
  }
};
// let dataFetched, nameFirst, nameLast, totalGames, points, assists, rebounds, position, fgp, blocks, turnovers, steals, plusMinus, playerTeam, logoLink;

let stats = {
  points: 0,
  assists: 0,
  rebounds: 0,
  position: "",
  fgp: 0,
  blocks: 0,
  turnovers: 0,
  steals: 0,
  plusMinus: 0,
  playerTeam: "",
  logoLink: "",
}

async function searchPlayer() {
  try {
    // Collect user inputs
    const typed = document.getElementById("playerName").value.toLowerCase();
    season = document.getElementById("season").value;

    // Parse the first and last name (disregard caps)
    const space = typed.lastIndexOf(" ");
    const firstName = typed.substring(0, space);
    const lastName = typed.substring(space + 1, typed.length);

    // fetch API data for player information and get json file
    const response = await fetch(`https://api-nba-v1.p.rapidapi.com/players?search=${lastName}`, options);
    const data = await response.json();

    // Find playerID 
    let playerId = 0;

    for (let i = 0; i < data.response.length; i++) {
      let currentFirst = data.response[i].firstname;
      currentFirst = currentFirst.toLowerCase();
      let currentLast = data.response[i].lastname;
      currentLast = currentLast.toLowerCase();

      if (currentFirst === firstName && currentLast === lastName) {
        playerId = data.response[i].id;
        nameFirst = data.response[i].firstname;
        nameLast = data.response[i].lastname;
        break;
      }
    }
    console.log("Player ID: " + playerId);
    console.log("Season: " + season);

    // Fetch player's data in input season
    const response2 = await fetch(`https://api-nba-v1.p.rapidapi.com/players/statistics?id=${playerId}&season=${season}`, options);
    const playerData = await response2.json();
    dataFetched = playerData;

    // Calculate Stats
    mainStats();
    await subStats();

    // Display Information
    updateHeadline(season);
    updateStats();
    displayOn();
  }
  catch (error) {
    console.error(error);
  }
}

function displayOn() {
  const statsElement = document.getElementById("statsSection");
  statsElement.style = "";

  window.scrollTo({
    top: document.body.scrollHeight,
    behavior: 'smooth'
  });
}

function updateHeadline(season) {
  // get element of headline 
  const headlineElement = document.getElementById("headlineText");
  const nameElement = document.getElementById("nameText");
  const seasonElement = document.getElementById("seasonText");
  const logoElement = document.getElementById("logoPicture");

  //update headline
  headlineElement.textContent = `${nameFirst} ${nameLast} averaged ${stats.points} points, ${stats.assists} assists, and ${stats.rebounds} rebounds in ${totalGames} games in ${season}.`;
  nameElement.textContent = `${nameFirst} ${nameLast}`;
  seasonElement.textContent = `${season} Season`;
  logoElement.src = `${stats.logoLink}`;
}

async function mainStats() {
  try {
    let data = dataFetched;

    // find player's stats
    let gamesTotal = data.response.length;
    let totalPoints = 0;
    let totalAssists = 0;
    let totalRebounds = 0;

    // add totals
    for (let i = 0; i < data.response.length; i++) {
      totalPoints += data.response[i].points;
      totalAssists += data.response[i].assists;
      totalRebounds += data.response[i].totReb;

      if (data.response[i].min === "0:00" || data.response[i].min === null) {
        gamesTotal--;
      }
    }

    //average stats
    // points = parseFloat((totalPoints / gamesTotal).toFixed(1));
    // assists = parseFloat((totalAssists / gamesTotal).toFixed(1));
    // rebounds = parseFloat((totalRebounds / gamesTotal).toFixed(1));

    stats.points = parseFloat((totalPoints / gamesTotal).toFixed(1));
    stats.assists = parseFloat((totalAssists / gamesTotal).toFixed(1));
    stats.rebounds = parseFloat((totalRebounds / gamesTotal).toFixed(1));

    // update games total
    totalGames = gamesTotal;
    // console.log("Points: " + points);
    // console.log("TESTING Points: " + stats.points);
    // console.log("Assists: " + assists);
    // console.log("Rebounds: " + rebounds);
    // console.log("Games: " + totalGames);
  } catch (error) {
    console.error(error);
  }
}

async function subStats() {
  try {
    let data = dataFetched;
    console.log(data);

    //find player's position
    let pos;
    let team;
    let logo;
    let found = false;
    let index = 0;

    while (!found && index < data.response.length) {
      pos = data.response[index].pos;
      team = data.response[index].team.name;
      logo = data.response[index].team.logo;
      if (pos !== null && team !== null) {
        found = true;
      }
      index++;
    }

    // find player stats
    let totalFgp = 0;
    let totalBlocks = 0;
    let totalTurnovers = 0;
    let totalSteals = 0;
    let totalPlusMinus = 0;

    // add totals
    for (let i = 0; i < data.response.length; i++) {
      totalFgp += Number(data.response[i].fgp);
      totalPlusMinus += Number(data.response[i].plusMinus);
      totalBlocks += data.response[i].blocks;
      totalTurnovers += data.response[i].turnovers;
      totalSteals += data.response[i].steals;
    }

    //average stats
    // fgp = parseFloat((totalFgp / totalGames).toFixed(1));
    // plusMinus = parseFloat((totalPlusMinus / totalGames).toFixed(1));
    // blocks = parseFloat((totalBlocks / totalGames).toFixed(1));
    // turnovers = parseFloat((totalTurnovers / totalGames).toFixed(1));
    // steals = parseFloat((totalSteals / totalGames).toFixed(1));

    stats.fgp = parseFloat((totalFgp / totalGames).toFixed(1));
    stats.plusMinus = parseFloat((totalPlusMinus / totalGames).toFixed(1));
    stats.blocks = parseFloat((totalBlocks / totalGames).toFixed(1));
    stats.turnovers = parseFloat((totalTurnovers / totalGames).toFixed(1));
    stats.steals = parseFloat((totalSteals / totalGames).toFixed(1));

    // set variables outside of scope
    stats.position = findPosition(pos);
    stats.playerTeam = team;
    stats.logoLink = logo
    // console.log("FGP: " + stats.fgp);
    // console.log("blocks: " + blocks);
    // console.log("turnovers: " + turnovers);
    // console.log("steals: " + steals);
    // console.log("+/-: " + plusMinus);
    // console.log("Position: " + position);
    // console.log("Team: " + team);
  }
  catch (error) {
    console.error(error);
  }
}

function findPosition(pos) {
  if (pos === "PG" || pos === "SG" || pos === "G") {
    return "Guard";
  } else if (pos === "SF" || pos === "PF" || pos === "F") {
    return "Forward";
  } else if (pos === "C") {
    return "Center";
  } else {
    return "Unknown";
  }
}

function updateStats() {
  for (let current in stats) {
    const element = document.getElementById(`${current}Text`);
    if (element) {
      element.textContent = current === 'fgp' ? `${stats[current]}%` : `${stats[current]}`
    }
  }
}








