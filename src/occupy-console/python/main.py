def print_welcome_banner():
    print("")
    print("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++")
    print("+                                                                                             +")
    print("+                                        Occupy-console v0.0                                  +")
    print("+                                                                                             +")
    print("+                                      tim.ashton.la@gmail.com                                +")
    print("+                                                                                             +")
    print("+                                                                                             +")
    print("+                                                                                             +")
    print("+                                       S - Start    H - Help                                 +")
    print("+                                                                                             +")
    print("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++")
    print("")

def get_help():
    print("")
    print("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++")
    print("+                                                                                             +")
    print("+  Help                                                                                       +")
    print("+                                                                                             +")
    print("+    1. The players take turns selecting sectors.                                             +")
    print("+    2. A player's turn starts by that player choosing a sector.                              +")
    print("+    3. If the selected sector is empty, player claims it by placing settlers in the sector.  +")
    print("+    4. If it is already occupied, the player can challenge or pass.                          +")
    print("+    5. If the player passes, the turn ends.                                                  +")
    print("+    6. If the player challenges, they pick a settler count for the challenge.                +")
    print("+    7. The largest settler count wins the challenge and takes the sector.                    +")
    print("+    8. the game ends when all sectors are claimed or all players are out of settlers.        +")
    print("+    9. The player with the highest number of claimed sectors, wins the game.                 +")
    print("+                                                                                             +")
    print("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++")

def start_game():
    print("")
    print("   123")
    print("A: 000")
    print("B: 000")
    print("C: 000")

def main():
    print_welcome_banner()

    operation = input("\"S\" or \"H\" to continue: ").lower()

    if operation == "s":
        start_game()
    elif operation == "h":
        get_help()
    else:
        print("Key not recognized.")

if __name__ == "__main__":
    main()