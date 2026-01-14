import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-centered-badge',
  templateUrl: './centered-badge.component.html',
  styleUrls: ['./centered-badge.component.scss']
})
export class CenteredBadgeComponent implements OnInit {
  @Input() isEnabled: boolean;
  @Input() icon = 'check';

  constructor() { }

  ngOnInit(): void {
  }

}
