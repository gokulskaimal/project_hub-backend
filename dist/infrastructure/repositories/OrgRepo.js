"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrgRepo = void 0;
const inversify_1 = require("inversify");
const Organization_1 = require("../../domain/entities/Organization");
let OrgRepo = class OrgRepo {
    constructor() {
        this.organizations = [];
        this.nextId = 1;
    }
    async create(org) {
        const newOrg = {
            id: this.nextId.toString(),
            name: org.name || '',
            status: org.status || 'ACTIVE',
            createdAt: org.createdAt || new Date(),
            updatedAt: new Date(),
            ...org
        };
        this.nextId++;
        this.organizations.push(newOrg);
        return newOrg;
    }
    async findById(id) {
        return this.organizations.find(org => org.id === id) || null;
    }
    async findByName(name) {
        return this.organizations.find(org => org.name.toLowerCase().trim() === name.toLowerCase().trim()) || null;
    }
    async findAll() {
        return [...this.organizations];
    }
    async update(id, data) {
        const orgIndex = this.organizations.findIndex(org => org.id === id);
        if (orgIndex === -1) {
            throw new Error('Organization not found');
        }
        this.organizations[orgIndex] = {
            ...this.organizations[orgIndex],
            ...data,
            updatedAt: new Date()
        };
        return this.organizations[orgIndex];
    }
    async delete(id) {
        await this.update(id, {
            status: Organization_1.OrganizationStatus.INACTIVE,
            deletedAt: new Date()
        });
    }
    /**
     * ✅ ADDED: Hard delete - REQUIRED BY INTERFACE
     */
    async hardDelete(id) {
        const orgIndex = this.organizations.findIndex(org => org.id === id);
        if (orgIndex === -1) {
            throw new Error('Organization not found');
        }
        this.organizations.splice(orgIndex, 1);
    }
    /**
     * ✅ ADDED: Find by status - REQUIRED BY INTERFACE
     */
    async findByStatus(status) {
        return this.organizations.filter(org => org.status === status);
    }
    async findPaginated(limit, offset, searchTerm) {
        let filtered = [...this.organizations];
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(org => org.name.toLowerCase().includes(search));
        }
        const total = filtered.length;
        const organizations = filtered.slice(offset, offset + limit);
        const hasMore = offset + limit < total;
        return { organizations, total, hasMore };
    }
    async count() {
        return this.organizations.length;
    }
    /**
     * ✅ FIXED: Count by specific status - MATCHES INTERFACE SIGNATURE
     */
    async countByStatus(status) {
        return this.organizations.filter(org => org.status === status).length;
    }
    async nameExists(name, excludeId) {
        return this.organizations.some(org => org.name.toLowerCase().trim() === name.toLowerCase().trim() &&
            org.id !== excludeId);
    }
    /**
     * ✅ FIXED: Get stats - MATCHES INTERFACE SIGNATURE
     */
    async getStats() {
        const total = this.organizations.length;
        const active = this.organizations.filter(org => org.status === 'ACTIVE').length;
        const inactive = this.organizations.filter(org => org.status === 'INACTIVE').length;
        const byStatus = {};
        this.organizations.forEach(org => {
            byStatus[org.status] = (byStatus[org.status] || 0) + 1;
        });
        return { total, active, inactive, byStatus };
    }
};
exports.OrgRepo = OrgRepo;
exports.OrgRepo = OrgRepo = __decorate([
    (0, inversify_1.injectable)()
], OrgRepo);
//# sourceMappingURL=OrgRepo.js.map