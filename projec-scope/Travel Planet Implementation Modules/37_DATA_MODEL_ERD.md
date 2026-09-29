# DATA MODEL / ERD BLUEPRINT

## Identity

User, Organization, Tenant, Workspace, Role, Permission, Membership.

## Travel

Traveler, Customer, Destination, Place, Experience, Hotel, Transport, Supplier, Product, Offer, Inventory.

## Commercial

Lead, Enquiry, Opportunity, Quote, Order, Booking, Payment, Refund, Promotion.

## Journey

Trip, Itinerary, ItineraryItem, TripTask, Disruption, JourneyEvent.

## Documents

Document, DocumentVersion, DocumentRelation, Template, TemplateVersion, TemplateBlock, Generation.

## Social

Circle, Membership, Discussion, Event, GroupTrip, Recommendation, TravelerMatch.

## Platform

FeatureFlag, Schedule, Release, Mode, ModeVersion, Rollover, Rollout, HealthGate, Incident, Approval, AuditEvent.

## Localization

Locale, Translation, TranslationMemory, Term, LocalizedEntity.

## Rule

Separate canonical identity from localized presentation and operational state.
