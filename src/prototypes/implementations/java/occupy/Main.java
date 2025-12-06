package prototypes.implementations.java.occupy;

public class Main {
    public static void main(String[] args) {
        System.out.println("");
        System.out.println("**************************************");
        System.out.println("*************** Occupy ***************");
        System.out.println("**************************************");
        System.out.println("");

        Game game;
        game = new Game("Sally", "Jack");

        System.out.println(game);

        Board board = new Board();
        board.printBoard();
    }

}
