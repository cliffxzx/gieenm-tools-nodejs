import { ParameterizedContext } from 'koa';

import { isNull } from 'util';
import * as api from '../apis/firewall';

export default {
  async floorAuth(ctx: ParameterizedContext, next: () => Promise<void>): Promise<void> {
    const { flr }: { flr: keyof typeof api.floor } = ctx.params;
    const { authorization: auth }: { authorization: string } = ctx.request.header;

    if (!(flr in api.floor)) {
      ctx.status = 400;
      ctx.body = {
        message: 'Invalid floor parameter.',
      };

      return;
    }

    ctx.floorAuth = { flr, auth };
    await next();
  },
  async getAllAddress(ctx: ParameterizedContext): Promise<void> {
    const IPs = await api.getAllAddress(ctx.floorAuth);
    ctx.body = IPs;
  },
  async addAddress(ctx: ParameterizedContext): Promise<void> {
    const res = await api.addAddress(ctx.floorAuth, ctx.request.body);
    ctx.status = (res ? 200 : 400);
    ctx.body = res;
  },
  async delAddress(ctx: ParameterizedContext): Promise<void> {
    const res = await api.delAddress(ctx.floorAuth, ctx.request.body);
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

      const group = await api.getAddressGroup(ctx.floorAuth, id);
      ctx.body = group;
    }
  },
  async getAllAddressGroup(ctx: ParameterizedContext): Promise<void> {
    const groups = await api.getAllAddressGroup(ctx.floorAuth);
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

    const res = await api.updateAddressGroup(ctx.floorAuth, { id, name, inGroup });

    ctx.status = (res ? 200 : 400);
    ctx.body = res;
  },
  async getAllAnFlow(ctx: ParameterizedContext): Promise<void> {
    const anFlows = await api.getAllAnFlow(ctx.floorAuth);
    ctx.status = isNull(anFlows) ? 400 : 200;
    ctx.body = anFlows;
  },
  async delAllAnFlow(ctx: ParameterizedContext): Promise<void> {
    const res = await api.delAllAnFlow(ctx.floorAuth);
    ctx.status = res ? 200 : 400;
  },
};
