import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { RoleDeactivatedEvent } from "src/roles/roles.events";
import { UserDeactivatedEvent } from "src/users/user.events";
import { RoleusersService } from "./roleusers.service";

@Injectable()
export class UserRoleDomainListener {
  constructor(private readonly userRoleService: RoleusersService) {}

  @OnEvent(UserDeactivatedEvent.name)
  async onUserDeactivated(event: UserDeactivatedEvent): Promise<void> {
    await this.userRoleService.deactivateByUser(event.userId);
  }

  @OnEvent(RoleDeactivatedEvent.name)
  async onRoleDeactivated(event: RoleDeactivatedEvent): Promise<void> {
    await this.userRoleService.deactivateByRole(event.roleId);
  }
}