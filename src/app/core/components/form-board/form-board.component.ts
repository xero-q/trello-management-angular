/**
 * @class FormBoardComponent
 * @description Component that handles board creation form
 */
import { NgIf } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  OnInit,
  output,
  signal,
  ViewChild,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TrelloService } from '../../services/trello.service';
import { ToastrService } from 'ngx-toastr';

/**
 * Component that provides a form for creating new Trello boards
 * Handles form validation and board creation
 */
@Component({
  selector: 'app-form-board',
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './form-board.component.html',
  styleUrl: './form-board.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormBoardComponent implements OnInit, AfterViewInit {
  /**
   * Reactive form group for board creation
   */
  public boardForm!: FormGroup;

  /**
   * Event emitter that triggers when a board is added
   * @event
   */
  public readonly boardAdded = output<void>();

  /**
   * Flag indicating if the form is currently submitting
   */
  protected readonly isSubmitting = signal(false);

  /**
   * ViewChild reference to the name input element
   */
  @ViewChild('nameInput')
  protected readonly nameInput!: ElementRef<HTMLInputElement>;

  /**
   * Form builder service for creating reactive forms
   */
  private readonly fb = inject(FormBuilder);

  /**
   * Service for Trello API interactions
   */
  private readonly trelloService = inject(TrelloService);

  /**
   * Toast notification service
   */
  private readonly toastr = inject(ToastrService);

  /**
   * Lifecycle hook that initializes the form
   */
  ngOnInit() {
    this.boardForm = this.fb.group({
      name: ['', Validators.required],
    });
  }

  /**
   * Lifecycle hook that focuses the name input after view initialization
   */
  ngAfterViewInit(): void {
    setTimeout(() => this.nameInput.nativeElement.focus(), 0);
  }

  /**
   * Handles form submission
   * Creates a new board using the Trello service
   * @description Submits the form and creates a new board if the form is valid
   */
  onSubmit() {
    if (this.boardForm.valid) {
      this.isSubmitting.set(true);
      const name = this.boardForm.get('name')?.value.trim();
      this.trelloService.addNewBoard(name).subscribe({
        /**
         * Handles successful board creation
         * @param board - Newly created board
         */
        next: () => {
          this.boardAdded.emit();
          this.boardForm.reset();
          this.isSubmitting.set(false);
          this.toastr.success('Board created successfully');
        },
        /**
         * Handles board creation error
         */
        error: () => {
          this.isSubmitting.set(false);
          this.toastr.error('Error while creating board');
        },
      });
    } else {
      this.boardForm.markAllAsTouched();
    }
  }
}
