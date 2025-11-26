import { Router } from "express";
import deckController from "../controllers/deckController";
import cardController from "../controllers/cardController";
import playerController from "../controllers/playerController";

const route = Router();

route.get("/decks/top", deckController.getBestDecks);
route.post("/decks/suggestion", deckController.getDeckSuggestion);

route.get("/cards", cardController.getBestDecks);
route.get("/cards/most-used", cardController.getMostUsedCards);
route.get("/cards/:id", cardController.getCardById);

route.get("/players/never-won", playerController.neverWon);
route.get("/players/best", playerController.bestPlayers);
route.get("/players/above-average-trophies", playerController.aboveAverage);

export default route;
