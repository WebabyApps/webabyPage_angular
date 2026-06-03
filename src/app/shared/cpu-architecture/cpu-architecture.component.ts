import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'app-cpu-architecture',
  standalone: true,
  templateUrl: './cpu-architecture.component.html',
  styleUrls: ['./cpu-architecture.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CpuArchitectureComponent {
  @Input() text = 'webaby';
}
