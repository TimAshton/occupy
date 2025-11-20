package prototypes.implementations.java.occupy;

public class Game {

    private int gameId;
    private Player player1;
    private Player player2;
    private int turnMarker;

    public Game(String player1Name, String player2Name) {
        super();

        this.gameId = 1;
        this.turnMarker = 1;

        this.player1 = new Player(player1Name);
        this.player2 = new Player(player2Name);
    }

    @Override
    public String toString() {
       return "Game ID: " + gameId + "\n" + 
              "Player One: " + player1 + " (" + this.player1.settlerCount + ")\n" +
              "Player Two: " + player2 + " (" + this.player2.settlerCount + ")\n" +
              "Turn Marker: " + this.turnMarker ; 
    }

}
