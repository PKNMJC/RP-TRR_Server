-- DropForeignKey
ALTER TABLE `ticket` DROP FOREIGN KEY `Ticket_assignedTo_fkey`;

-- DropForeignKey
ALTER TABLE `ticket` DROP FOREIGN KEY `Ticket_userId_fkey`;

-- DropForeignKey
ALTER TABLE `ticketlog` DROP FOREIGN KEY `TicketLog_updatedBy_fkey`;

-- AlterTable
ALTER TABLE `ticketlog` MODIFY `status` ENUM('OPEN', 'IN_PROGRESS', 'WAITING_USER', 'DONE', 'CANCEL') NOT NULL;

-- AddForeignKey
ALTER TABLE `Ticket` ADD CONSTRAINT `Ticket_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ticket` ADD CONSTRAINT `Ticket_assignedTo_fkey` FOREIGN KEY (`assignedTo`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TicketLog` ADD CONSTRAINT `TicketLog_updatedBy_fkey` FOREIGN KEY (`updatedBy`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
