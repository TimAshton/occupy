import numpy as np


def create_board_numpy():
    sectors = np.array([
        [
            (0,2,0,0),
            (1,2,0,0),
            (2,2,0,0)
        ],
        [
            (0,1,0,0),
            (1,1,0,0),
            (2,1,0,0)
        ],
        [
            (0,0,0,0),
            (1,0,0,0),
            (2,0,0,0)
        ]
    ])

    return sectors

def create_board_basic():
    sectors = [
        [
            {
                "coords": (0, 3, 0),
                "status": 0
            },
            {
                "coords": (1, 3, 0),
                "status": 0
            },
            {
                "coords": (2, 3, 0),
                "status": 0
            },
            {
                "coords": (3, 3, 0),
                "status": 0
            }
        ],
        [
            {
                "coords": (0, 2, 0),
                "status": 0
            },
            {
                "coords": (1, 2, 0),
                "status": 0
            },
            {
                "coords": (2, 2, 0),
                "status": 0
            },
            {
                "coords": (3, 2, 0),
                "status": 0
            }
        ],
        [
            {
                "coords": (0, 1, 0),
                "status": 0
            },
            {
                "coords": (1, 1, 0),
                "status": 0
            },
            {
                "coords": (2, 1, 0),
                "status": 0
            },
            {
                "coords": (3, 1, 0),
                "status": 0
            }
        ],
        [
            {
                "coords": (0, 0, 0),
                "status": 0
            },
            {
                "coords": (1, 0, 0),
                "status": 0
            },
            {
                "coords": (2, 0, 0),
                "status": 0
            },
            {
                "coords": (3, 0, 0),
                "status": 0
            }
        ]
    ]

    return sectors

def print_board(board):
    if isinstance(board, list):
        for row in board:
            for sector in row:
                print(sector['status'], end='')
            print("\n", end='')
    
    if isinstance(board, np.ndarray):
        print("[numpy not implemented]")

def main():
    board_np = create_board_numpy()
    board_basic = create_board_basic()

    print_board(board_np)
    print_board(board_basic)

if __name__ == "__main__":
    main()