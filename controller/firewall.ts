import { ParameterizedContext } from 'koa';

import { isNull } from 'util';
import { getRepository } from 'typeorm';

import * as api from '../api/firewall';
import { Host } from '../entity/Host';

export default {
  async firewallHost(ctx: ParameterizedContext, next: () => Promise<void>): Promise<void> {
    const { host: name }: { host: string } = ctx.params;
    try {
      const host = (await getRepository(Host).findOneOrFail({ name })).get();
      ctx.firewall = { host };
    } catch (e) {
      console.error(e);
      ctx.status = 400;
      ctx.body = e;

      return;
    }

    await next();
  },
  async getAllAddress(ctx: ParameterizedContext): Promise<void> {
    const { url, auth } = ctx.firewall.host as Host;
    const IPs = await api.getAllAddress(url, auth);
    ctx.body = IPs;
  },
  async addAddress(ctx: ParameterizedContext): Promise<void> {
    const { url, auth } = ctx.firewall.host as Host;
    const res = await api.addAddress(url, auth, ctx.request.body);
    ctx.status = (res ? 200 : 400);
    ctx.body = res;
  },
  async delAddress(ctx: ParameterizedContext): Promise<void> {
    const { url, auth } = ctx.firewall.host as Host;
    const res = await api.delAddress(url, auth, ctx.request.body);
    ctx.status = (res ? 200 : 400);
  },
  async getAddressGroup(ctx: ParameterizedContext, next: () => Promise<void>): Promise<void> {
    if (ctx.params.id === 'detail') {
      next();
    } else {
      const sid: string = ctx.params.id.split('-');
      const id: api.ID = {
        n: sid[1],
        time: sid[0],
      };

      const { url, auth } = ctx.firewall.host as Host;
      const group = await api.getAddressGroup(url, auth, id);
      ctx.body = group;
    }
  },
  async getAllAddressGroup(ctx: ParameterizedContext): Promise<void> {
    const { url, auth } = ctx.firewall.host as Host;
    const groups = await api.getAllAddressGroup(url, auth);
    ctx.body = groups;
  },
  async updateAddressGroup(ctx: ParameterizedContext): Promise<void> {
    const sid: string = ctx.params.id.split('-');
    const id: api.ID = {
      n: sid[1],
      time: sid[0],
    };
    const { name } = ctx.request.body;
    let { inGroup } = ctx.request.body;

    inGroup = inGroup.map((time: string) => ({ id: { time } }));

    const { url, auth } = ctx.firewall.host as Host;
    const res = await api.updateAddressGroup(url, auth, { id, name, inGroup });

    ctx.status = (res ? 200 : 400);
    ctx.body = res;
  },
  async getAllAnFlow(ctx: ParameterizedContext): Promise<void> {
    const { url, auth } = ctx.firewall.host as Host;
    const anFlows = await api.getAllAnFlow(url, auth);
    ctx.status = isNull(anFlows) ? 400 : 200;
    ctx.body = anFlows;
  },
  async delAllAnFlow(ctx: ParameterizedContext): Promise<void> {
    const { url, auth } = ctx.firewall.host as Host;
    const res = await api.delAllAnFlow(url, auth);
    ctx.status = res ? 200 : 400;
  },
};
