package prototypes.implementations.java.occupy;

public class Sector {

    private int sectorId;
    private int ownerId; // Null means empty.

    private int x, y;

    public Sector(int x, int y) {
        this.x = x;
        this.y = y;
    }

    // origin-x
    // origin-y
    // sideLangth

    // or locationId -> managed by a Board class.

    // Play area should be definable...in a Board class.

}
