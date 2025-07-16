// components/admin/quiz-data-table.tsx
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { QuizStatus, Difficulty } from "@/generated/prisma";

// Re-using the Quiz interface from the main component
interface Quiz {
  id: string;
  title: string;
  status: QuizStatus;
  difficulty: Difficulty;
  category?: { name: string };
  creator?: { name: string };
  updatedAt: string;
  _count: {
    attempts: number;
    questions: number;
  };
}

interface QuizDataTableProps {
  title: string;
  quizzes: Quiz[];
  isLoading: boolean;
  page: number;
  setPage: (page: number | ((prev: number) => number)) => void;
  limit: number;
  totalCount: number;
  isMyQuizzes?: boolean;
  onDelete: (quizId: string) => void;
}

const statusBadgeVariant = (status: QuizStatus) => {
  switch (status) {
    case "DRAFT":
      return "secondary";
    case "PUBLISHED":
      return "default";
    case "ARCHIVED":
      return "destructive";
    default:
      return "default";
  }
};

const difficultyBadgeVariant = (difficulty: Difficulty) => {
  switch (difficulty) {
    case "EASY":
      return "default";
    case "MEDIUM":
      return "secondary";
    case "HARD":
      return "destructive";
    default:
      return "default";
  }
};

export function QuizDataTable({
  title,
  quizzes,
  isLoading,
  page,
  setPage,
  limit,
  totalCount,
  isMyQuizzes = false,
  onDelete,
}: QuizDataTableProps) {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Difficulty</TableHead>
              <TableHead>Category</TableHead>
              {!isMyQuizzes && <TableHead>Creator</TableHead>}
              <TableHead>Questions</TableHead>
              <TableHead>Attempts</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={isMyQuizzes ? 8 : 9}
                  className="h-24 text-center"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : quizzes.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={isMyQuizzes ? 8 : 9}
                  className="h-24 text-center"
                >
                  No quizzes found.
                </TableCell>
              </TableRow>
            ) : (
              quizzes.map((quiz) => (
                <TableRow key={quiz.id}>
                  <TableCell className="font-medium">{quiz.title}</TableCell>
                  <TableCell>
                    <Badge variant={statusBadgeVariant(quiz.status)}>
                      {quiz.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={difficultyBadgeVariant(quiz.difficulty)}>
                      {quiz.difficulty}
                    </Badge>
                  </TableCell>
                  <TableCell>{quiz.category?.name || "-"}</TableCell>
                  {!isMyQuizzes && (
                    <TableCell>{quiz.creator?.name || "-"}</TableCell>
                  )}
                  <TableCell>{quiz._count.questions}</TableCell>
                  <TableCell>{quiz._count.attempts}</TableCell>
                  <TableCell>
                    {new Date(quiz.updatedAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/quizzes/${quiz.id}`}>
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        {isMyQuizzes && (
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/quizzes/${quiz.id}/edit`}>
                              Edit
                            </Link>
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => onDelete(quiz.id)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="text-sm text-muted-foreground">
          Page {page} of {Math.ceil(totalCount / limit) || 1}
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => prev + 1)}
            disabled={page * limit >= totalCount}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
