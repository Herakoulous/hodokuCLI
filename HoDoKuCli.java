import sudoku.*;
import solver.*;

public class HoDoKuCLI {
    public static void main(String[] args) {
        if (args.length == 0) {
            System.err.println("Usage: java HoDoKuCLI <puzzle>");
            System.exit(1);
        }
        
        Sudoku2 sudoku = new Sudoku2();
        sudoku.setSudoku(args[0]);
        
        SudokuSolver solver = SudokuSolverFactory.getDefaultSolverInstance();
        SolutionStep step = solver.getHint(sudoku, false);
        
        if (step != null) {
            System.out.println(step.toString());
        } else {
            System.out.println("No hint available");
        }
    }
}