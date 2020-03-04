import {
  newOrganizationForUser,
  updateOrganizationForUser,
  deleteOrganizationForUser,
  getOrganizationForUser,
  getOrganizationBillingForUser,
  updateOrganizationBillingForUser,
  getOrganizationInvoicesForUser,
  getOrganizationSubscriptionsForUser,
  getOrganizationPricingPlansForUser,
  getOrganizationSourcesForUser,
  getOrganizationSourceForUser,
  createOrganizationSourceForUser,
  updateOrganizationSourceForUser,
  deleteOrganizationSourceForUser,
  getAllOrganizationDataForUser,
  getOrganizationMembershipsForUser,
  createOrganizationSubscriptionForUser,
  getOrganizationSubscriptionForUser,
  updateOrganizationSubscriptionForUser,
  getOrganizationInvoiceForUser,
  getOrganizationApiKeysForUser,
  createApiKeyForUser,
  getOrganizationApiKeyForUser,
  updateApiKeyForUser,
  deleteApiKeyForUser,
  getOrganizationDomainsForUser,
  createDomainForUser,
  getOrganizationDomainForUser,
  updateDomainForUser,
  deleteDomainForUser,
  verifyDomainForUser,
  getOrganizationWebhooksForUser,
  createWebhookForUser,
  getOrganizationWebhookForUser,
  updateWebhookForUser,
  deleteWebhookForUser,
  inviteMemberToOrganization,
  getOrganizationMembershipForUser,
  deleteOrganizationMembershipForUser,
  updateOrganizationMembershipForUser,
  getOrganizationApiKeyLogsForUser
} from "../../rest/organization";
import {
  RESOURCE_CREATED,
  respond,
  RESOURCE_UPDATED,
  RESOURCE_DELETED,
  RESOURCE_SUCCESS
} from "@staart/messages";
import {
  Get,
  Put,
  Patch,
  Delete,
  Controller,
  ClassMiddleware,
  Request,
  Response,
  Middleware,
  Post
} from "@staart/server";
import { authHandler, validator } from "../../helpers/middleware";
import { MembershipRole } from "../../interfaces/enum";
import {
  organizationUsernameToId,
  localsToTokenOrKey
} from "../../helpers/utils";
import { joiValidate, Joi } from "@staart/validate";

@Controller("v1/organizations")
@ClassMiddleware(authHandler)
export class OrganizationController {
  @Put()
  @Middleware(
    validator(
      {
        name: Joi.string().required()
      },
      "body"
    )
  )
  async put(req: Request, res: Response) {
    await newOrganizationForUser(res.locals.token.id, req.body, res.locals);
    return respond(RESOURCE_CREATED);
  }

  @Get(":id")
  async get(req: Request, res: Response) {
    const id = await organizationUsernameToId(req.params.id);
    joiValidate({ id: Joi.string().required() }, { id });
    const organization = await getOrganizationForUser(
      localsToTokenOrKey(res),
      id
    );
    return organization;
  }

  @Patch(":id")
  @Middleware(
    validator(
      {
        name: Joi.string(),
        username: Joi.string().regex(/^[a-z0-9\-]+$/i),
        forceTwoFactor: Joi.boolean(),
        autoJoinDomain: Joi.boolean(),
        onlyAllowDomain: Joi.boolean(),
        ipRestrictions: Joi.string(),
        profilePicture: Joi.string()
      },
      "body"
    )
  )
  async patch(req: Request, res: Response) {
    const id = await organizationUsernameToId(req.params.id);
    joiValidate({ id: Joi.string().required() }, { id });
    await updateOrganizationForUser(
      localsToTokenOrKey(res),
      id,
      req.body,
      res.locals
    );
    return respond(RESOURCE_UPDATED, { resource: "Team" });
  }

  @Delete(":id")
  async delete(req: Request, res: Response) {
    const organizationId = await organizationUsernameToId(req.params.id);
    joiValidate(
      { organizationId: Joi.string().required() },
      { organizationId }
    );
    await deleteOrganizationForUser(
      res.locals.token.id,
      organizationId,
      res.locals
    );
    return respond(RESOURCE_DELETED);
  }

  @Get(":id/billing")
  async getBilling(req: Request, res: Response) {
    const organizationId = await organizationUsernameToId(req.params.id);
    joiValidate(
      { organizationId: Joi.string().required() },
      { organizationId }
    );
    return await getOrganizationBillingForUser(
      localsToTokenOrKey(res),
      organizationId
    );
  }

  @Patch(":id/billing")
  async patchBilling(req: Request, res: Response) {
    const organizationId = await organizationUsernameToId(req.params.id);
    joiValidate(
      { organizationId: Joi.string().required() },
      { organizationId }
    );
    await updateOrganizationBillingForUser(
      localsToTokenOrKey(res),
      organizationId,
      req.body,
      res.locals
    );
    return { success: true, message: "organization-billing-updated" };
  }

  @Get(":id/invoices")
  async getInvoices(req: Request, res: Response) {
    const organizationId = await organizationUsernameToId(req.params.id);
    joiValidate(
      { organizationId: Joi.string().required() },
      { organizationId }
    );
    const subscriptionParams = { ...req.query };
    joiValidate(
      {
        start: Joi.string(),
        billing: Joi.string().valid("charge_automatically", "send_invoice"),
        itemsPerPage: Joi.number(),
        plan: Joi.string(),
        status: Joi.string()
      },
      subscriptionParams
    );
    return await getOrganizationInvoicesForUser(
      localsToTokenOrKey(res),
      organizationId,
      subscriptionParams
    );
  }

  @Get(":id/invoices/:invoiceId")
  async getInvoice(req: Request, res: Response) {
    const organizationId = await organizationUsernameToId(req.params.id);
    const invoiceId = req.params.invoiceId;
    joiValidate(
      {
        organizationId: Joi.string().required(),
        invoiceId: Joi.string().required()
      },
      { organizationId, invoiceId }
    );
    return await getOrganizationInvoiceForUser(
      localsToTokenOrKey(res),
      organizationId,
      invoiceId
    );
  }

  @Get(":id/sources")
  async getSources(req: Request, res: Response) {
    const organizationId = await organizationUsernameToId(req.params.id);
    joiValidate(
      { organizationId: Joi.string().required() },
      { organizationId }
    );
    const subscriptionParams = { ...req.query };
    joiValidate(
      {
        start: Joi.string(),
        itemsPerPage: Joi.number()
      },
      subscriptionParams
    );
    return await getOrganizationSourcesForUser(
      localsToTokenOrKey(res),
      organizationId,
      subscriptionParams
    );
  }

  @Get(":id/sources/:sourceId")
  async getSource(req: Request, res: Response) {
    const organizationId = await organizationUsernameToId(req.params.id);
    const sourceId = req.params.sourceId;
    joiValidate(
      {
        organizationId: Joi.string().required(),
        sourceId: Joi.string().required()
      },
      { organizationId, sourceId }
    );
    return await getOrganizationSourceForUser(
      localsToTokenOrKey(res),
      organizationId,
      sourceId
    );
  }

  @Get(":id/subscriptions")
  async getSubscriptions(req: Request, res: Response) {
    const organizationId = await organizationUsernameToId(req.params.id);
    joiValidate(
      { organizationId: Joi.string().required() },
      { organizationId }
    );
    const subscriptionParams = { ...req.query };
    joiValidate(
      {
        start: Joi.string(),
        billing: Joi.string().valid("charge_automatically", "send_invoice"),
        itemsPerPage: Joi.number(),
        plan: Joi.string(),
        status: Joi.string()
      },
      subscriptionParams
    );
    return await getOrganizationSubscriptionsForUser(
      localsToTokenOrKey(res),
      organizationId,
      subscriptionParams
    );
  }

  @Get(":id/subscriptions/:subscriptionId")
  async getSubscription(req: Request, res: Response) {
    const organizationId = await organizationUsernameToId(req.params.id);
    const subscriptionId = req.params.subscriptionId;
    joiValidate(
      {
        organizationId: Joi.string().required(),
        subscriptionId: Joi.string().required()
      },
      { organizationId, subscriptionId }
    );
    return await getOrganizationSubscriptionForUser(
      localsToTokenOrKey(res),
      organizationId,
      subscriptionId
    );
  }

  @Patch(":id/subscriptions/:subscriptionId")
  async patchSubscription(req: Request, res: Response) {
    const organizationId = await organizationUsernameToId(req.params.id);
    const subscriptionId = req.params.subscriptionId;
    const data = req.body;
    joiValidate(
      {
        organizationId: Joi.string().required(),
        subscriptionId: Joi.string().required()
      },
      { organizationId, subscriptionId }
    );
    joiValidate(
      {
        billing: Joi.string().valid("charge_automatically", "send_invoice"),
        cancel_at_period_end: Joi.boolean(),
        coupon: Joi.string(),
        default_source: Joi.string()
      },
      data
    );
    await updateOrganizationSubscriptionForUser(
      localsToTokenOrKey(res),
      organizationId,
      subscriptionId,
      data,
      res.locals
    );
    return respond(RESOURCE_UPDATED);
  }

  @Put(":id/subscriptions")
  async putSubscriptions(req: Request, res: Response) {
    const organizationId = await organizationUsernameToId(req.params.id);
    joiValidate(
      { organizationId: Joi.string().required() },
      { organizationId }
    );
    const subscriptionParams = { ...req.body };
    joiValidate(
      {
        plan: Joi.string().required(),
        billing: Joi.string().valid("charge_automatically", "send_invoice"),
        tax_percent: Joi.number(),
        number_of_seats: Joi.number()
      },
      subscriptionParams
    );
    await createOrganizationSubscriptionForUser(
      localsToTokenOrKey(res),
      organizationId,
      subscriptionParams,
      res.locals
    );
    return respond(RESOURCE_CREATED);
  }

  @Get(":id/pricing")
  async getPlans(req: Request, res: Response) {
    const organizationId = await organizationUsernameToId(req.params.id);
    joiValidate(
      {
        organizationId: Joi.string().required()
      },
      { organizationId }
    );
    return await getOrganizationPricingPlansForUser(
      localsToTokenOrKey(res),
      organizationId
    );
  }

  @Put(":id/sources")
  async putSources(req: Request, res: Response) {
    const organizationId = await organizationUsernameToId(req.params.id);
    joiValidate(
      { organizationId: Joi.string().required() },
      { organizationId }
    );
    await createOrganizationSourceForUser(
      localsToTokenOrKey(res),
      organizationId,
      req.body,
      res.locals
    );
    return respond(RESOURCE_CREATED);
  }

  @Delete(":id/sources/:sourceId")
  async deleteSource(req: Request, res: Response) {
    const sourceId = req.params.sourceId;
    const organizationId = await organizationUsernameToId(req.params.id);
    joiValidate(
      {
        organizationId: Joi.string().required(),
        sourceId: Joi.string().required()
      },
      { organizationId, sourceId }
    );
    await deleteOrganizationSourceForUser(
      localsToTokenOrKey(res),
      organizationId,
      sourceId,
      res.locals
    );
    return respond(RESOURCE_DELETED);
  }

  @Patch(":id/sources/:sourceId")
  async patchSource(req: Request, res: Response) {
    const sourceId = req.params.sourceId;
    const organizationId = await organizationUsernameToId(req.params.id);
    joiValidate(
      {
        organizationId: Joi.string().required(),
        sourceId: Joi.string().required()
      },
      { organizationId, sourceId }
    );
    await updateOrganizationSourceForUser(
      localsToTokenOrKey(res),
      organizationId,
      sourceId,
      req.body,
      res.locals
    );
    return respond(RESOURCE_UPDATED);
  }

  @Get(":id/data")
  async getData(req: Request, res: Response) {
    const organizationId = await organizationUsernameToId(req.params.id);
    joiValidate(
      { organizationId: Joi.string().required() },
      { organizationId }
    );
    return await getAllOrganizationDataForUser(
      localsToTokenOrKey(res),
      organizationId
    );
  }

  @Get(":id/memberships")
  async getMemberships(req: Request, res: Response) {
    const organizationId = await organizationUsernameToId(req.params.id);
    joiValidate(
      { organizationId: Joi.string().required() },
      { organizationId }
    );
    return await getOrganizationMembershipsForUser(
      localsToTokenOrKey(res),
      organizationId,
      req.query
    );
  }

  @Put(":id/memberships")
  async putMemberships(req: Request, res: Response) {
    const organizationId = await organizationUsernameToId(req.params.id);
    const newMemberName = req.body.name;
    const newMemberEmail = req.body.email;
    const role = req.body.role;
    joiValidate(
      {
        organizationId: Joi.string().required(),
        newMemberName: Joi.string()
          .min(6)
          .required(),
        newMemberEmail: Joi.string()
          .email()
          .required(),
        role: Joi.number()
      },
      {
        organizationId,
        newMemberName,
        newMemberEmail,
        role
      }
    );
    await inviteMemberToOrganization(
      localsToTokenOrKey(res),
      organizationId,
      newMemberName,
      newMemberEmail,
      role || MembershipRole.MEMBER,
      res.locals
    );
    return respond(RESOURCE_CREATED);
  }

  @Get(":id/memberships/:membershipId")
  async getMembership(req: Request, res: Response) {
    const organizationId = await organizationUsernameToId(req.params.id);
    const membershipId = req.params.membershipId;
    joiValidate(
      {
        organizationId: Joi.string().required(),
        membershipId: Joi.string().required()
      },
      { organizationId, membershipId }
    );
    return await getOrganizationMembershipForUser(
      localsToTokenOrKey(res),
      organizationId,
      membershipId
    );
  }

  @Patch(":id/memberships/:membershipId")
  @Middleware(
    validator(
      {
        role: Joi.number()
          .min(1)
          .max(5)
      },
      "body"
    )
  )
  async updateMembership(req: Request, res: Response) {
    const organizationId = await organizationUsernameToId(req.params.id);
    const membershipId = req.params.membershipId;
    joiValidate(
      {
        organizationId: Joi.string().required(),
        membershipId: Joi.string().required()
      },
      { organizationId, membershipId }
    );
    await updateOrganizationMembershipForUser(
      localsToTokenOrKey(res),
      organizationId,
      membershipId,
      req.body
    );
    return respond(RESOURCE_UPDATED);
  }

  @Delete(":id/memberships/:membershipId")
  async deleteMembership(req: Request, res: Response) {
    const organizationId = await organizationUsernameToId(req.params.id);
    const membershipId = req.params.membershipId;
    joiValidate(
      {
        organizationId: Joi.string().required(),
        membershipId: Joi.string().required()
      },
      { organizationId, membershipId }
    );
    await deleteOrganizationMembershipForUser(
      localsToTokenOrKey(res),
      organizationId,
      membershipId
    );
    return respond(RESOURCE_DELETED);
  }

  @Get(":id/api-keys")
  async getUserApiKeys(req: Request, res: Response) {
    const id = await organizationUsernameToId(req.params.id);
    joiValidate({ id: Joi.string().required() }, { id });
    const apiKeyParams = { ...req.query };
    joiValidate(
      {
        start: Joi.string(),
        itemsPerPage: Joi.number()
      },
      apiKeyParams
    );
    return await getOrganizationApiKeysForUser(
      localsToTokenOrKey(res),
      id,
      apiKeyParams
    );
  }

  @Put(":id/api-keys")
  @Middleware(
    validator(
      {
        scopes: Joi.string(),
        ipRestrictions: Joi.string(),
        referrerRestrictions: Joi.string(),
        name: Joi.string(),
        description: Joi.string()
      },
      "body"
    )
  )
  async putUserApiKeys(req: Request, res: Response) {
    const id = await organizationUsernameToId(req.params.id);
    joiValidate({ id: Joi.string().required() }, { id });
    await createApiKeyForUser(
      localsToTokenOrKey(res),
      id,
      req.body,
      res.locals
    );
    return respond(RESOURCE_CREATED);
  }

  @Get(":id/api-keys/:apiKeyId")
  async getUserApiKey(req: Request, res: Response) {
    const id = await organizationUsernameToId(req.params.id);
    const apiKeyId = req.params.apiKeyId;
    joiValidate(
      {
        id: Joi.string().required(),
        apiKeyId: Joi.string().required()
      },
      { id, apiKeyId }
    );
    return await getOrganizationApiKeyForUser(
      localsToTokenOrKey(res),
      id,
      apiKeyId
    );
  }

  @Patch(":id/api-keys/:apiKeyId")
  @Middleware(
    validator(
      {
        scopes: Joi.string().allow(""),
        ipRestrictions: Joi.string().allow(""),
        referrerRestrictions: Joi.string().allow(""),
        name: Joi.string().allow(""),
        description: Joi.string().allow("")
      },
      "body"
    )
  )
  async patchUserApiKey(req: Request, res: Response) {
    const id = await organizationUsernameToId(req.params.id);
    const apiKeyId = req.params.apiKeyId;
    joiValidate(
      {
        id: Joi.string().required(),
        apiKeyId: Joi.string().required()
      },
      { id, apiKeyId }
    );
    await updateApiKeyForUser(
      localsToTokenOrKey(res),
      id,
      apiKeyId,
      req.body,
      res.locals
    );
    return respond(RESOURCE_UPDATED);
  }

  @Delete(":id/api-keys/:apiKeyId")
  async deleteUserApiKey(req: Request, res: Response) {
    const id = await organizationUsernameToId(req.params.id);
    const apiKeyId = req.params.apiKeyId;
    joiValidate(
      {
        id: Joi.string().required(),
        apiKeyId: Joi.string().required()
      },
      { id, apiKeyId }
    );
    await deleteApiKeyForUser(
      localsToTokenOrKey(res),
      id,
      apiKeyId,
      res.locals
    );
    return respond(RESOURCE_DELETED);
  }

  @Get(":id/api-keys/:apiKeyId/logs")
  async getUserApiKeyLogs(req: Request, res: Response) {
    const id = await organizationUsernameToId(req.params.id);
    const apiKeyId = req.params.apiKeyId;
    joiValidate(
      {
        id: Joi.string().required(),
        apiKeyId: Joi.string().required()
      },
      { id, apiKeyId }
    );
    return await getOrganizationApiKeyLogsForUser(
      localsToTokenOrKey(res),
      id,
      apiKeyId,
      req.query
    );
  }

  @Get(":id/domains")
  async getUserDomains(req: Request, res: Response) {
    const id = await organizationUsernameToId(req.params.id);
    joiValidate({ id: Joi.string().required() }, { id });
    const domainParams = { ...req.query };
    joiValidate(
      {
        start: Joi.string(),
        itemsPerPage: Joi.number()
      },
      domainParams
    );
    return await getOrganizationDomainsForUser(
      localsToTokenOrKey(res),
      id,
      domainParams
    );
  }

  @Put(":id/domains")
  @Middleware(
    validator(
      {
        domain: Joi.string()
      },
      "body"
    )
  )
  async putUserDomains(req: Request, res: Response) {
    const id = await organizationUsernameToId(req.params.id);
    joiValidate({ id: Joi.string().required() }, { id });
    await createDomainForUser(
      localsToTokenOrKey(res),
      id,
      req.body,
      res.locals
    );
    return respond(RESOURCE_CREATED);
  }

  @Get(":id/domains/:domainId")
  async getUserDomain(req: Request, res: Response) {
    const id = await organizationUsernameToId(req.params.id);
    const domainId = req.params.domainId;
    joiValidate(
      {
        id: Joi.string().required(),
        domainId: Joi.string().required()
      },
      { id, domainId }
    );
    return await getOrganizationDomainForUser(
      localsToTokenOrKey(res),
      id,
      domainId
    );
  }

  @Patch(":id/domains/:domainId")
  @Middleware(
    validator(
      {
        domain: Joi.string()
      },
      "body"
    )
  )
  async patchUserDomain(req: Request, res: Response) {
    const id = await organizationUsernameToId(req.params.id);
    const domainId = req.params.domainId;
    joiValidate(
      {
        id: Joi.string().required(),
        domainId: Joi.string().required()
      },
      { id, domainId }
    );
    await updateDomainForUser(
      localsToTokenOrKey(res),
      id,
      domainId,
      req.body,
      res.locals
    );
    return respond(RESOURCE_UPDATED);
  }

  @Delete(":id/domains/:domainId")
  async deleteUserDomain(req: Request, res: Response) {
    const id = await organizationUsernameToId(req.params.id);
    const domainId = req.params.domainId;
    joiValidate(
      {
        id: Joi.string().required(),
        domainId: Joi.string().required()
      },
      { id, domainId }
    );
    await deleteDomainForUser(
      localsToTokenOrKey(res),
      id,
      domainId,
      res.locals
    );
    return respond(RESOURCE_DELETED);
  }

  @Post(":id/domains/:domainId/verify")
  async verifyOrganizationDomain(req: Request, res: Response) {
    const id = await organizationUsernameToId(req.params.id);
    const domainId = req.params.domainId;
    const method = req.body.method || req.query.method;
    joiValidate(
      {
        id: Joi.string().required(),
        domainId: Joi.string().required(),
        method: Joi.string()
          .allow(["file", "dns"])
          .only()
      },
      { id, domainId, method }
    );
    await verifyDomainForUser(
      localsToTokenOrKey(res),
      id,
      domainId,
      method,
      res.locals
    );
    return respond(RESOURCE_SUCCESS);
  }

  @Get(":id/webhooks")
  async getOrganizationWebhooks(req: Request, res: Response) {
    const id = await organizationUsernameToId(req.params.id);
    joiValidate({ id: Joi.string().required() }, { id });
    const webhookParams = { ...req.query };
    joiValidate(
      {
        start: Joi.string(),
        itemsPerPage: Joi.number()
      },
      webhookParams
    );
    return await getOrganizationWebhooksForUser(
      localsToTokenOrKey(res),
      id,
      webhookParams
    );
  }

  @Put(":id/webhooks")
  @Middleware(
    validator(
      {
        event: Joi.string().required(),
        url: Joi.string().required(),
        contentType: Joi.string(),
        secret: Joi.string().allow(""),
        isActive: Joi.boolean()
      },
      "body"
    )
  )
  async putOrganizationWebhooks(req: Request, res: Response) {
    const id = await organizationUsernameToId(req.params.id);
    joiValidate({ id: Joi.string().required() }, { id });
    await createWebhookForUser(
      localsToTokenOrKey(res),
      id,
      req.body,
      res.locals
    );
    return respond(RESOURCE_CREATED);
  }

  @Get(":id/webhooks/:webhookId")
  async getOrganizationWebhook(req: Request, res: Response) {
    const id = await organizationUsernameToId(req.params.id);
    const webhookId = req.params.webhookId;
    joiValidate(
      {
        id: Joi.string().required(),
        webhookId: Joi.string().required()
      },
      { id, webhookId }
    );
    return await getOrganizationWebhookForUser(
      localsToTokenOrKey(res),
      id,
      webhookId
    );
  }

  @Patch(":id/webhooks/:webhookId")
  @Middleware(
    validator(
      {
        event: Joi.string(),
        url: Joi.string(),
        contentType: Joi.string(),
        secret: Joi.string(),
        isActive: Joi.boolean()
      },
      "body"
    )
  )
  async patchOrganizationWebhook(req: Request, res: Response) {
    const id = await organizationUsernameToId(req.params.id);
    const webhookId = req.params.webhookId;
    joiValidate(
      {
        id: Joi.string().required(),
        webhookId: Joi.string().required()
      },
      { id, webhookId }
    );
    await updateWebhookForUser(
      localsToTokenOrKey(res),
      id,
      webhookId,
      req.body,
      res.locals
    );
    return respond(RESOURCE_UPDATED);
  }

  @Delete(":id/webhooks/:webhookId")
  async deleteOrganizationWebhook(req: Request, res: Response) {
    const id = await organizationUsernameToId(req.params.id);
    const webhookId = req.params.webhookId;
    joiValidate(
      {
        id: Joi.string().required(),
        webhookId: Joi.string().required()
      },
      { id, webhookId }
    );
    await deleteWebhookForUser(
      localsToTokenOrKey(res),
      id,
      webhookId,
      res.locals
    );
    return respond(RESOURCE_DELETED);
  }
}
