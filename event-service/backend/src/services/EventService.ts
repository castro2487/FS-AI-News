import { PrismaClient, EventStatus as PrismaEventStatus } from '@prisma/client';
import { Event, CreateEventDTO, UpdateEventDTO, EventFilters, PaginatedResponse } from '../types/event.types';
import { validateStatusTransition } from '../validators/eventValidators';

export class EventService {
  constructor(private prisma: PrismaClient) {}

  async create(data: CreateEventDTO): Promise<Event> {
    const event = await this.prisma.event.create({
      data: {
        ...data,
        status: data.status as PrismaEventStatus || PrismaEventStatus.DRAFT,
      },
    });

    return this.mapToEvent(event);
  }

  async update(id: string, data: UpdateEventDTO): Promise<Event> {
    const existing = await this.prisma.event.findUnique({ where: { id } });
    
    if (!existing) {
      throw new Error('Event not found');
    }

    if (data.status) {
      const validation = validateStatusTransition(
        existing.status as any,
        data.status
      );
      
      if (!validation.valid) {
        throw new Error(validation.error);
      }
    }

    const updated = await this.prisma.event.update({
      where: { id },
      data: {
        ...data,
        status: data.status as PrismaEventStatus,
      },
    });

    return this.mapToEvent(updated);
  }

  async findById(id: string): Promise<Event | null> {
    const event = await this.prisma.event.findUnique({ where: { id } });
    return event ? this.mapToEvent(event) : null;
  }

  async findAll(
    filters: EventFilters,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<Event>> {
    const where: any = {};

    if (filters.dateFrom || filters.dateTo) {
      where.startAt = {};
      if (filters.dateFrom) {
        where.startAt.gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        where.startAt.lte = new Date(filters.dateTo + 'T23:59:59Z');
      }
    }

    if (filters.locations) {
      const locations = filters.locations.split(',').map(l => l.trim());
      where.OR = locations.map(loc => ({
        location: {
          contains: loc,
          mode: 'insensitive' as const,
        },
      }));
    }

    if (filters.status) {
      const statuses = filters.status.split(',').map(s => s.trim() as PrismaEventStatus);
      where.status = { in: statuses };
    }

    const [events, total] = await Promise.all([
      this.prisma.event.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { startAt: 'asc' },
      }),
      this.prisma.event.count({ where }),
    ]);

    return {
      events: events.map(this.mapToEvent),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findPublic(
    filters: EventFilters,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<any>> {
    const result = await this.findAll(
      {
        ...filters,
        status: [PrismaEventStatus.PUBLISHED, PrismaEventStatus.CANCELLED].join(','),
      },
      page,
      limit
    );

    return {
      events: result.events.map(event => ({
        id: event.id,
        title: event.title,
        startAt: event.startAt,
        endAt: event.endAt,
        location: event.location,
        status: event.status,
        isUpcoming: new Date(event.startAt) > new Date(),
      })),
      pagination: result.pagination,
    };
  }

  private mapToEvent(event: any): Event {
    return {
      id: event.id,
      title: event.title,
      startAt: event.startAt.toISOString(),
      endAt: event.endAt.toISOString(),
      location: event.location,
      status: event.status,
      internalNotes: event.internalNotes || undefined,
      createdBy: event.createdBy || undefined,
      updatedAt: event.updatedAt.toISOString(),
    };
  }
}