import sudoku.*;
import solver.*;

public class HoDoKuCLI {
    public static void main(String[] args) {
        if (args.length == 0) {
            System.err.println("Usage: java HoDoKuCLI <puzzle> [step_number]");
            System.exit(1);
        }
        
        String puzzleString = args[0];
        int stepNumber = args.length > 1 ? Integer.parseInt(args[1]) : 1;
        
        Sudoku2 sudoku = new Sudoku2();
        sudoku.setSudoku(puzzleString);
        
        SudokuSolver solver = SudokuSolverFactory.getDefaultSolverInstance();
        
        // Get and apply steps until we reach the requested step number
        for (int i = 1; i <= stepNumber; i++) {
            SolutionStep step = solver.getHint(sudoku, false);
            
            if (step == null) {
                System.out.println("No more hints available");
                return;
            }
            
            if (i == stepNumber) {
                // This is the step we want - print it
                System.out.println(step.toString());
                return;
            }
            
            // Apply this step and continue to next
            solver.doStep(sudoku, step);
        }
    }
}