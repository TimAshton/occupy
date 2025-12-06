package prototypes.implementations.java.occupy;

import java.util.ArrayList;;

public class Board {

    // Two points define the size of the baord.
    private int sectorLength = 1;

    private int boundryTopLeftX = 0;
    private int boundryTopLeftY = 0;

    private int boundryBottomRightX = 10;
    private int boundryBottomRightY = 10;

    private String marker = "X";

    private ArrayList<Sector> sectors = new ArrayList<>();

    public Board() {
        // Init
    }

    public int getWidth() {
        return boundryBottomRightX - boundryTopLeftX;
    }

    public int getHeight() {
        return boundryBottomRightY - boundryTopLeftY;
    }

    public void printBoard() {
        System.out.print("\n");

        for(int i = sectorLength; i <= getHeight();i = i + sectorLength) {
            for(int n = sectorLength; n <= getWidth(); n = n + sectorLength) {
                System.out.print(marker + "("+ i +","+ n +")");
                sectors.add(new Sector(i, n)); // Print and build board should be separate.
            }
            System.out.print("\n");

            System.out.println(sectors);
        } 
        
        System.out.print("\n");
    }

}
