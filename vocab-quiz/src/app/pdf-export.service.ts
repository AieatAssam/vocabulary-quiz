import { Injectable } from '@angular/core';
import { Quiz, QuizQuestion } from './quiz.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Injectable({
  providedIn: 'root'
})
export class PdfExportService {

  constructor() { }

  /**
   * Generates and downloads a PDF with certificate and detailed quiz results
   * @param quiz Completed quiz with results
   */
  async exportQuizResults(quiz: Quiz): Promise<void> {
    // Create PDF document with A4 size
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Create certificate page
    this.addCertificatePage(pdf, quiz);
    
    // Add page break
    pdf.addPage();
    
    // Add detailed results
    this.addDetailedResults(pdf, quiz);
    
    // Save and download the PDF
    const filename = `vocabulary-quiz-results-${new Date().toISOString().slice(0, 10)}.pdf`;
    pdf.save(filename);
  }
  
  /**
   * Adds a certificate-style page to the PDF
   */
  private addCertificatePage(pdf: jsPDF, quiz: Quiz): void {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    
    // Add border
    pdf.setDrawColor(70, 81, 181); // #4651b5 (primary color)
    pdf.setLineWidth(1);
    pdf.rect(margin, margin, pageWidth - (margin * 2), pageHeight - (margin * 2));
    
    // Add title
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(24);
    pdf.setTextColor(70, 81, 181);
    const title = 'Certificate of Completion';
    const titleWidth = pdf.getStringUnitWidth(title) * 24 / pdf.internal.scaleFactor;
    pdf.text(title, (pageWidth - titleWidth) / 2, 50);
    
    // Add certificate text
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0);
    const subText = 'This is to certify that';
    const subTextWidth = pdf.getStringUnitWidth(subText) * 16 / pdf.internal.scaleFactor;
    pdf.text(subText, (pageWidth - subTextWidth) / 2, 70);
    
    // Add placeholder for name (could be filled with user input in future)
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(20);
    const name = 'Student';
    const nameWidth = pdf.getStringUnitWidth(name) * 20 / pdf.internal.scaleFactor;
    pdf.text(name, (pageWidth - nameWidth) / 2, 85);
    
    // Add completion text
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(16);
    const completionText = 'has successfully completed the Vocabulary Quiz';
    const completionWidth = pdf.getStringUnitWidth(completionText) * 16 / pdf.internal.scaleFactor;
    pdf.text(completionText, (pageWidth - completionWidth) / 2, 100);
    
    // Add quiz info
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(14);
    
    // Add quiz type
    const typeText = `Quiz Type: ${quiz.settings.quizType.charAt(0).toUpperCase() + quiz.settings.quizType.slice(1)}`;
    pdf.text(typeText, margin + 10, 120);
    
    // Add quiz date
    const dateText = `Date: ${new Date().toLocaleDateString()}`;
    pdf.text(dateText, margin + 10, 130);
    
    // Add questions count
    const questionsText = `Questions: ${quiz.questions.length}`;
    pdf.text(questionsText, margin + 10, 140);
    
    // Add score
    pdf.setFontSize(24);
    pdf.setTextColor(70, 81, 181);
    const scoreText = `Score: ${quiz.score?.toFixed(0)}%`;
    const scoreWidth = pdf.getStringUnitWidth(scoreText) * 24 / pdf.internal.scaleFactor;
    pdf.text(scoreText, (pageWidth - scoreWidth) / 2, 165);
    
    // Add grade text
    pdf.setFontSize(18);
    let gradeText = '';
    if (quiz.score && quiz.score >= 90) {
      gradeText = 'Excellent';
    } else if (quiz.score && quiz.score >= 80) {
      gradeText = 'Very Good';
    } else if (quiz.score && quiz.score >= 70) {
      gradeText = 'Good';
    } else if (quiz.score && quiz.score >= 60) {
      gradeText = 'Satisfactory';
    } else {
      gradeText = 'Needs Improvement';
    }
    const gradeWidth = pdf.getStringUnitWidth(gradeText) * 18 / pdf.internal.scaleFactor;
    pdf.text(gradeText, (pageWidth - gradeWidth) / 2, 180);
    
    // Add app branding at the bottom
    pdf.setFontSize(12);
    pdf.setTextColor(100, 100, 100);
    const brandText = 'Vocabulary Quiz App';
    const brandWidth = pdf.getStringUnitWidth(brandText) * 12 / pdf.internal.scaleFactor;
    pdf.text(brandText, (pageWidth - brandWidth) / 2, pageHeight - 30);
  }
  
  /**
   * Adds a detailed breakdown of quiz results
   */
  private addDetailedResults(pdf: jsPDF, quiz: Quiz): void {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 20;
    let yPosition = 20;
    
    // Add title
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(20);
    pdf.setTextColor(70, 81, 181);
    const title = 'Detailed Quiz Results';
    const titleWidth = pdf.getStringUnitWidth(title) * 20 / pdf.internal.scaleFactor;
    pdf.text(title, (pageWidth - titleWidth) / 2, yPosition);
    yPosition += 15;
    
    // Add quiz summary
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    
    // Calculate correct answers
    const correctAnswers = quiz.questions.filter(q => q.isCorrect).length;
    
    pdf.text(`Total Questions: ${quiz.questions.length}`, margin, yPosition);
    yPosition += 8;
    pdf.text(`Correct Answers: ${correctAnswers}`, margin, yPosition);
    yPosition += 8;
    pdf.text(`Incorrect Answers: ${quiz.questions.length - correctAnswers}`, margin, yPosition);
    yPosition += 8;
    pdf.text(`Score: ${quiz.score?.toFixed(0)}%`, margin, yPosition);
    yPosition += 8;
    
    // Add time taken if available
    if (quiz.startTime && quiz.endTime) {
      const timeInMs = quiz.endTime.getTime() - quiz.startTime.getTime();
      const minutes = Math.floor(timeInMs / 60000);
      const seconds = Math.floor((timeInMs % 60000) / 1000);
      pdf.text(`Time Taken: ${minutes}m ${seconds}s`, margin, yPosition);
      yPosition += 8;
    }
    
    // Add question type explanation
    pdf.setFont('helvetica', 'italic');
    pdf.setFontSize(10);
    pdf.text('* Word: You were asked to provide the word matching the given definition', margin, yPosition);
    yPosition += 6;
    pdf.text('* Definition: You were asked to provide the definition for the given word', margin, yPosition);
    yPosition += 10;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(12);
    
    // Add separator line
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.5);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;
    
    // Add results header
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.text('Question', margin, yPosition);
    pdf.text('Your Answer', margin + 90, yPosition);
    pdf.text('Result', pageWidth - margin - 20, yPosition);
    yPosition += 8;
    
    // Add separator line
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.5);
    pdf.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 8;
    
    // Add each question and result
    pdf.setFont('helvetica', 'normal');
    
    for (let i = 0; i < quiz.questions.length; i++) {
      const question = quiz.questions[i];
      
      // Check if we need a new page
      if (yPosition > pdf.internal.pageSize.getHeight() - 30) {
        pdf.addPage();
        yPosition = 20;
      }
      
      const startY = yPosition; // Remember starting position for this row
      
      // Question type and text
      const questionPrefix = `${i + 1}.`;
      pdf.setFont('helvetica', 'bold');
      pdf.text(questionPrefix, margin, yPosition);
      
      // Add question type label
      const questionType = question.type === 'word' ? 'Word' : 'Definition';
      pdf.text(questionType, margin + 10, yPosition);
      pdf.setFont('helvetica', 'normal');
      
      // Add the question prompt on a new line with clear formatting
      yPosition += 6;
      
      // Split long text for the prompt
      const promptWidth = 75; // Slightly narrower to avoid overlapping columns
      const textLines = this.splitTextToFit(pdf, question.prompt, promptWidth);
      for (let j = 0; j < textLines.length; j++) {
        pdf.text(textLines[j], margin + 5, yPosition + (j * 5));
        if (j > 0) {
          yPosition += 5; // Adjust position for wrapped text
        }
      }
      
      // Remember the current y position after the question
      const afterQuestionY = yPosition + 8;
      
      // Reset to the beginning of the row for the answer column
      yPosition = startY;
      
      // User answer - in the second column
      const userAnswer = question.userAnswer || '(No answer)';
      pdf.text(userAnswer, margin + 90, yPosition);
      
      // Result - in the third column
      pdf.setTextColor(question.isCorrect ? 76 : 244, question.isCorrect ? 175 : 67, question.isCorrect ? 80 : 54);
      pdf.text(question.isCorrect ? 'Correct' : 'Incorrect', pageWidth - margin - 20, yPosition);
      pdf.setTextColor(0, 0, 0); // Reset text color
      
      // If incorrect, show correct answer
      if (!question.isCorrect) {
        yPosition += 6;
        pdf.setFont('helvetica', 'italic');
        
        // Handle potentially long correct answers with wrapping
        const correctAnswerPrefix = 'Correct answer: ';
        pdf.text(correctAnswerPrefix, margin + 90, yPosition);
        
        // Split the answer text if needed
        const answerWidth = 60; // Width for answer text
        const answerLines = this.splitTextToFit(pdf, question.answer, answerWidth);
        for (let j = 0; j < answerLines.length; j++) {
          // First line is already positioned after "Correct answer: "
          if (j === 0) {
            pdf.text(answerLines[j], margin + 90 + pdf.getStringUnitWidth(correctAnswerPrefix) * 12 / pdf.internal.scaleFactor, yPosition);
          } else {
            yPosition += 5;
            pdf.text(answerLines[j], margin + 90, yPosition);
          }
        }
        
        pdf.setFont('helvetica', 'normal');
        
        // If there are multiple correct answers for definition questions, show them all
        if (question.type === 'definition' && question.allAnswers && question.allAnswers.length > 1) {
          yPosition += 6;
          pdf.text('All accepted answers:', margin + 90, yPosition);
          
          for (let j = 0; j < question.allAnswers.length; j++) {
            yPosition += 6;
            
            // Split each answer if needed
            const allAnswerLines = this.splitTextToFit(pdf, question.allAnswers[j], answerWidth);
            for (let k = 0; k < allAnswerLines.length; k++) {
              if (k === 0) {
                pdf.text(`- ${allAnswerLines[k]}`, margin + 95, yPosition);
              } else {
                yPosition += 5;
                pdf.text(`  ${allAnswerLines[k]}`, margin + 95, yPosition);
              }
            }
          }
        }
      }
      
      // Set yPosition to the maximum of the two columns
      yPosition = Math.max(yPosition + 8, afterQuestionY);
      
      // Add a separator line between questions
      pdf.setDrawColor(220, 220, 220);
      pdf.setLineWidth(0.2);
      pdf.line(margin, yPosition - 4, pageWidth - margin, yPosition - 4);
      yPosition += 4; // Add a bit of space after the line
    }
    
    // Add footer
    const footerText = 'Generated by Vocabulary Quiz App';
    const footerWidth = pdf.getStringUnitWidth(footerText) * 10 / pdf.internal.scaleFactor;
    pdf.setFontSize(10);
    pdf.setTextColor(150, 150, 150);
    pdf.text(footerText, (pageWidth - footerWidth) / 2, pdf.internal.pageSize.getHeight() - 10);
  }
  
  /**
   * Splits text to fit within specified width
   */
  private splitTextToFit(pdf: jsPDF, text: string, maxWidth: number): string[] {
    // First check if the text fits as is
    if (pdf.getStringUnitWidth(text) * 12 / pdf.internal.scaleFactor <= maxWidth) {
      return [text];
    }
    
    // Otherwise split by words and combine until maxWidth is reached
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    
    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      if (pdf.getStringUnitWidth(testLine) * 12 / pdf.internal.scaleFactor <= maxWidth) {
        currentLine = testLine;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    
    // Don't forget to add the last line
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return lines;
  }
} 