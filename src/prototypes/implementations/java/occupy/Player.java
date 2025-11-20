package prototypes.implementations.java.occupy;

public class Player {

    String name;
    int settlerCount;

    public Player(String name) {
        this.name = name;
        this.settlerCount = 100;
    }

    @Override
    public String toString() {
       return this.name; 
    }
}
