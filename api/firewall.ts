import axios from 'axios';
import cheerio from 'cheerio';
import moment from 'moment';
import 'moment-timezone';

import { URLSearchParams } from 'url';
import configs from '../configs';

const pageCount = Number.parseInt(configs.firewall.pageCount!, 10) || 10;

export interface ID {
  n: string,
  time: string,
}

export interface Address {
  id: ID,
  name: string,
  ip: string,
  subnet: string,
  mac: string,
}

export interface SmallAddress {
  id: { time: string },
  name: string
}

export interface AddressGroup {
  id: ID,
  name: string,
  inGroup: SmallAddress[],
  outGroup?: SmallAddress[]
}

export interface AnFlow {
  ip: string,
  name: string,
  mac: string,
  date: Date,
}

export const getAllAddress = async (url: string, auth: string): Promise<Address[]> => {
  try {
    let
      pageNow = 0,
      pageTotal = 0;

    const
      IPs: Address[] = [],
      processHtml = async (se: number) => {
        const
          _IPs: Address[] = [],
          $ = cheerio.load((await axios.get(`${url}/address.cgi`, {
            params: {
              menu: 'click_v=23\nclick_v=24\nclick_v=25\n',
              MULTI_LANG: 'ch',
              se,
            },
            headers: {
              Authorization: auth,
            },
          })).data);

        if (!pageNow && !pageTotal) {
          const _pn = $('input[name="cp1"]'),
            _pt = $('tr.list_tool_text_attr > td');

          pageNow = _pn.length ? +_pn.val() : 0;
          pageTotal = _pt.length ? +_pt.first().text().split('/')[1] : 0;
        }

        $('body > center > form > table.FixedTable tr.Col').each((idx, row) => {
          const
            col = $(row).find('td'),
            ip = col.eq(3).text()
              .replace(' ', '')
              .split('/'),
            id = col.eq(5).find('button').attr('onclick')!
              .replace(/[)\s';]/gi, '')
              .split(/[(,]/);

          _IPs.push({
            id: { n: id[3], time: id[2] },
            name: col.eq(0).text(),
            ip: ip[0],
            subnet: ip[1],
            mac: col.eq(4).text(),
          });
        });

        return _IPs;
      };

    IPs.push(...await processHtml(1));

    const pages = Array.from(Array(pageTotal - pageNow), (_, i) => i + 1);
    IPs.push(...(await Promise.all(pages.map((i) => processHtml(i * pageCount + 1)))).flat(2));

    return IPs;
  } catch (e) {
    console.error(e);
  }

  return [];
};

export const addAddress = async (url: string, auth: string, address: Address)
  : Promise<Address | null> => {
  try {
    const
      $ = cheerio.load((await axios.post(`${url}/address.cgi`, null, {
        params: {
          q: '1',
          s: '1',
          MULTI_LANG: 'ch',
          menu: 'click_v=23\nclick_v=24\nclick_v=25\n',
          ipv: '0',
          adstartip4: '0.0.0.0',
          interface: 'All',
          n: (await getAllAddress(url, auth)).length,
          id: (new Date().toISOString()).split(/[-T:.]/).slice(0, 6)
            .join(''),
          name: address.name,
          ip: address.ip,
          ip4: address.ip,
          nm4: address.subnet,
          mask: address.subnet,
          mac: address.mac,
          admac: address.mac,
        },
        headers: {
          Authorization: auth,
        },
      })).data);

    let res: Address | null = null;

    $('body > center > form > table.FixedTable tr.Col').each((idx, row) => {
      const
        col = $(row).find('td'),
        name = col.eq(0).text();

      if (name === address.name) {
        const
          ip = col.eq(3).text()
            .replace(' ', '')
            .split('/'),
          id = col.eq(5).find('button').attr('onclick')!
            .replace(/[)\s';]/gi, '')
            .split(/[(,]/);

        res = {
          id: { n: id[3], time: id[2] },
          name,
          ip: ip[0],
          subnet: ip[1],
          mac: col.eq(4).text(),
        };
      }
    });

    return res;
  } catch (e) {
    console.error(e);
  }

  return null;
};

export const delAddress = async (url: string, auth: string, { n, time }: ID): Promise<boolean> => {
  try {
    await axios.post(`${url}/address.cgi`, null, {
      params: {
        q: '3',
        s: '3',
        MULTI_LANG: 'ch',
        menu: 'click_v=23\nclick_v=24\nclick_v=25\n',
        id: time,
        n,
      },
      headers: {
        Authorization: auth,
      },
    });

    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
};

export const getAddressGroup = async (url: string, auth: string, id: ID)
  : Promise<AddressGroup | null> => {
  try {
    const
      $ = cheerio.load((await axios.post(`${url}/address.cgi`, null, {
        params: {
          q: '2',
          t: '1',
          menu: 'click_v=23\nclick_v=24\nclick_v=26',
          MULTI_LANG: 'ch',
          n: id.n,
          id: id.time,
        },
        headers: {
          Authorization: auth,
        },
      })).data);

    const
      table = $('body > center > form > table.MainTable > tbody > tr.Col > td > table'),
      inGroup: SmallAddress[] = [],
      outGroup: SmallAddress[] = [];

    table.find('select#avail_members > option').each((idx, row) => outGroup.push({
      id: { time: row.attribs.value },
      name: $(row).text(),
    }));
    outGroup.splice(0, 1);

    table.find('select#select_members > option').each((idx, row) => inGroup.push({
      id: { time: row.attribs.value },
      name: $(row).text(),
    }));
    inGroup.splice(0, 1);

    const group: AddressGroup = {
      id: {
        n: $('input[name="n"]').val(),
        time: $('input[name="id"]').val(),
      },
      name: table.find('input[name="name"]').val(),
      outGroup,
      inGroup,
    };

    return group;
  } catch (e) {
    console.log(e);
  }
  return null;
};

export const getAllAddressGroup = async (url: string, auth: string)
  : Promise<AddressGroup[] | null> => {
  try {
    let
      pageNow = 0,
      pageTotal = 0;

    const
      groups: AddressGroup[] = [],
      processHtml = async (se: number) => {
        const
          _groups: AddressGroup[] = [],
          $ = cheerio.load((await axios.get(`${url}/address.cgi`, {
            params: {
              t: 1,
              menu: 'click_v=23\nclick_v=24\nclick_v=26\n',
              MULTI_LANG: 'ch',
              se,
            },
            headers: {
              Authorization: auth,
            },
          })).data);

        if (!pageNow && !pageTotal) {
          const _pn = $('input[name="cp1"]'),
            _pt = $('tr.list_tool_text_attr > td');

          pageNow = _pn.length ? +_pn.val() : 0;
          pageTotal = _pt.length ? +_pt.first().text().split('/')[1] : 0;
        }

        await Promise.all(Array.from($('body > center > form > table.FixedTable tr.Col'))
          .map(async (row) => {
            const col = $(row);
            if (!col.text().match(/^\s*沒有記錄！\s*$/gi)) {
              const sid = col.find('button[type=submit]').attr('onclick')?.replace(/[)\s';]/gi, '')?.split(/[(,]/) as string[];
              const id: ID = { n: sid[3], time: sid[2] };

              const group = await getAddressGroup(url, auth, id);

              _groups.push(group!);
            }
          }));

        return _groups;
      };

    groups.push(...await processHtml(1));

    const pages = Array.from(Array(pageTotal - pageNow), (_, i) => i + 1);
    groups.push(...(await Promise.all(pages.map((i) => processHtml(i * pageCount + 1)))).flat(2));

    return groups;
  } catch (e) {
    console.log(e);
  }

  return null;
};

export const updateAddressGroup = async (url: string, auth: string, addressGroup: AddressGroup)
  : Promise<AddressGroup | null> => {
  try {
    await axios.post(`${url}/address.cgi`, null, {
      params: new URLSearchParams([
        ['q', '2'],
        ['t', '1'],
        ['s', '2'],
        ['MULTI_LANG', 'ch'],
        ['menu', 'click_v=23\nclick_v=24\nclick_v=26'],
        ['n', addressGroup.id.n],
        ['id', addressGroup.id.time],
        ['name', addressGroup.name],
        ...addressGroup.inGroup.map((address) => ['select_members', address.id.time] as [string, string]),
      ]),
      headers: {
        Authorization: auth,
      },
    });

    return await getAddressGroup(url, auth, addressGroup.id);
  } catch (e) {
    console.log(e);
  }

  return null;
};

export const getAllAnFlow = async (url: string, auth: string): Promise<AnFlow[] | null> => {
  try {
    let
      pageNow = 0,
      pageTotal = 0;

    const
      anFlows: AnFlow[] = [],
      processHtml = async (se: number) => {
        const
          _anFlows: AnFlow[] = [],
          $ = cheerio.load((await axios.get(`${url}/anflowlist.cgi`, {
            params: {
              menu: 'click_v=125\nclick_v=127',
              MULTI_LANG: 'ch',
              se,
            },
            headers: {
              Authorization: auth,
            },
          })).data);

        if (!pageNow && !pageTotal) {
          const _pn = $('input[name="cp1"]'),
            _pt = $('tr.list_tool_text_attr > td');

          pageNow = _pn.length ? +_pn.val() : 0;
          pageTotal = _pt.length ? +_pt.first().text().split('/')[1] : 0;
        }

        $('body > center > form > table.FixedTable tr.Col').each((idx, row) => {
          const col = $(row).find('td');

          _anFlows.push({
            ip: col.eq(2).attr('onmouseover')!.replace(/[)\s';]/gi, '').split(/[(,]/)[1].substr(12),
            mac: col.eq(3).text(),
            name: col.eq(2).text(),
            date: moment(col.eq(4).text(), 'MM/DD HH:mm:ss').add(8, 'hours').toDate(),
          });
        });

        return _anFlows;
      };

    anFlows.push(...await processHtml(1));

    const pages = Array.from(Array(pageTotal - pageNow), (_, i) => i + 1);
    anFlows.push(...(await Promise.all(pages.map((i) => processHtml(i * pageCount + 1)))).flat(2));

    return anFlows;
  } catch (e) {
    console.error(e);
  }

  return null;
};

export const delAllAnFlow = async (url: string, auth: string): Promise<boolean> => {
  try {
    await axios.post(`${url}/anflowlist.cgi`, null, {
      params: {
        empty: '1',
        q: '0',
        menu: 'click_v=125\nclick_v=127',
        MULTI_LANG: 'ch',
      },
      headers: {
        Authorization: auth,
      },
    });
    return true;
  } catch (e) {
    console.error(e);
  }

  return false;
};