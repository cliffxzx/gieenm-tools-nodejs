import { ParameterizedContext } from 'koa';

import { isNull } from 'util';
import { getRepository } from 'typeorm';

import * as api from '../api/firewall';
import { Host } from '../entity/Host';

export default {
  async hostAuth(ctx: ParameterizedContext, next: () => Promise<void>): Promise<void> {
    const { name }: { name: string } = ctx.params;
    const { authorization: auth }: { authorization: string } = ctx.request.header;
    try {
      const host = getRepository(Host).findOneOrFail({ name });
      ctx.hostAuth = { host, auth };
    } catch (e) {
      console.error(e);
      ctx.status = 400;
      ctx.body = e;

      return;
    }

    await next();
  },
  async getAllAddress(ctx: ParameterizedContext): Promise<void> {
    const { host, auth } = ctx.hostAuth;
    const IPs = await api.getAllAddress(host, auth);
    ctx.body = IPs;
  },
  async addAddress(ctx: ParameterizedContext): Promise<void> {
    const { host, auth } = ctx.hostAuth;
    const res = await api.addAddress(host, auth, ctx.request.body);
    ctx.status = (res ? 200 : 400);
    ctx.body = res;
  },
  async delAddress(ctx: ParameterizedContext): Promise<void> {
    const { host, auth } = ctx.hostAuth;
    const res = await api.delAddress(host, auth, ctx.request.body);
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

      const { host, auth } = ctx.hostAuth;
      const group = await api.getAddressGroup(host, auth, id);
      ctx.body = group;
    }
  },
  async getAllAddressGroup(ctx: ParameterizedContext): Promise<void> {
    const { host, auth } = ctx.hostAuth;
    const groups = await api.getAllAddressGroup(host, auth);
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

    const { host, auth } = ctx.hostAuth;
    const res = await api.updateAddressGroup(host, auth, { id, name, inGroup });

    ctx.status = (res ? 200 : 400);
    ctx.body = res;
  },
  async getAllAnFlow(ctx: ParameterizedContext): Promise<void> {
    const { host, auth } = ctx.hostAuth;
    const anFlows = await api.getAllAnFlow(host, auth);
    ctx.status = isNull(anFlows) ? 400 : 200;
    ctx.body = anFlows;
  },
  async delAllAnFlow(ctx: ParameterizedContext): Promise<void> {
    const { host, auth } = ctx.hostAuth;
    const res = await api.delAllAnFlow(host, auth);
    ctx.status = res ? 200 : 400;
  },
};
