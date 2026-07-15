export class UserDeactivatedEvent {
  constructor(
    public readonly userId: string,
  ) {}
}