import axios from 'axios';
import cheerio from 'cheerio';

import configs from '../configs';

export enum floor {
  '1f' = 'http://140.115.151.224:8080/cgi-bin',
  '2f' = 'http://140.115.151.230:8080/cgi-bin',
  '3f' = 'http://140.115.151.228:8080/cgi-bin',
  '4f' = 'http://140.115.151.223:8080/cgi-bin',
  '205r' = 'http://140.115.150.146:8080/cgi-bin',
  'wifi' = 'http://140.115.151.237:8080/cgi-bin',
}

export interface FloorAuth {
  flr: keyof typeof floor,
  auth: string,
}

export interface Address {
  id?: ID,
  name?: string,
  ip?: string,
  subnet?: string,
  mac?: string,
}

export interface ID {
  n?: string,
  time: string,
}

export interface AddressGroup {
  id?: ID,
  name?: string,
  addresses?: Address[],
}

export const getAllAddress = async ({ auth, flr }: FloorAuth) => {
  try {
    let
      pageNow = 0,
      pageTotal = 0;

    const
      { pageCount } = configs.firewall,
      IPs: Address[] = [],
      getAddress = async (se: number) => {
        const $ = cheerio.load((await axios.get(`${floor[flr]}/address.cgi`, {
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
          pageNow = +$('input[name="cp1"]').val();
          pageTotal = +$('tr.list_tool_text_attr > td').first().text().split('/')[1];
        }

        $('body > center > form > table.FixedTable tr.Col').each((idx, row) => IPs.push({
          name: row?.children[1]?.children[0]?.data as string,
          ip: row?.children[7]?.children[0]?.data?.split('/')?.[0]?.replace(' ', ''),
          subnet: row?.children[7]?.children[0]?.data?.split('/')?.[1]?.replace(' ', ''),
          mac: row?.children[9]?.children[0]?.data,
        }));
      };

    await getAddress(1);

    const pages = Array.from(Array(pageTotal - pageNow), (_, i) => i + 1);
    await Promise.all(pages.map((i) => getAddress(i * pageCount + 1)));

    return IPs;
  } catch (e) {
    console.error(e);
  }

  return [];
};

export const addAddress = async ({ auth, flr }: FloorAuth, address: Address) => {
  try {
    await axios.post(`${floor[flr]}/address.cgi`, null, {
      params: {
        q: '1',
        s: '1',
        MULTI_LANG: 'ch',
        menu: 'click_v=23\nclick_v=24\nclick_v=25\n',
        ipv: '0',
        adstartip4: '0.0.0.0',
        interface: 'All',
        n: (await getAllAddress({ auth, flr }))?.length,
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
    });

    return { success: true };
  } catch (e) {
    console.log(e);
    return { success: false };
  }
};

export const delAddress = async ({ auth, flr }: FloorAuth, { n, time }: ID) => {
  try {
    await axios.post(`${floor[flr]}/address.cgi`, null, {
      params: {
        q: '3',
        s: '3',
        MULTI_LANG: 'ch',
        menu: 'click_v=23\nclick_v=24\nclick_v=25\n',
        time,
        n,
      },
      headers: {
        Authorization: auth,
      },
    });

    return { success: true };
  } catch (e) {
    console.log(e);
    return { success: false };
  }
};

export const getAllAddressGroup = async ({ auth, flr }: FloorAuth) => {
  try {
    let
      pageNow = 0,
      pageTotal = 0;

    const
      { pageCount } = configs.firewall,
      groups: AddressGroup[] = [],
      getAddressGroup = async (se: number) => {
        const $ = cheerio.load((await axios.get(`${floor[flr]}/address.cgi`, {
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
          pageNow = +$('input[name="cp1"]').val();
          pageTotal = +$('tr.list_tool_text_attr > td').first().text().split('/')[1];
        }

        $('body > center > form > table.FixedTable tr.Col').each((idx, row) => {
          const aid = cheerio.load(row)('button[type=submit]')
            ?.attr('onclick')
            ?.replace(/[)\s';]/gi, '')
            .split(/[(,]/) as string[];

          groups.push({
            id: { time: aid[2], n: aid[3] },
            name: row?.children[1]?.children[0]?.data as string,
            addresses: row?.children[3]?.children[0]?.data?.split(', ').map((name) => ({ name })),
          });
        });
      };

    await getAddressGroup(1);

    const pages = Array.from(Array(pageTotal - pageNow), (_, i) => i + 1);
    await Promise.all(pages.map((i) => getAddressGroup(i * pageCount + 1)));

    return groups;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const getAddressGroup = async ({ auth, flr }: FloorAuth, { id }: AddressGroup) => {
  try {
    const
      $ = cheerio.load((await axios.post(`${floor[flr]}/address.cgi`, null, {
        params: {
          q: '2',
          t: '1',
          menu: 'click_v=23\nclick_v=24\nclick_v=26',
          MULTI_LANG: 'ch',
          n: id?.n,
          id: id?.time,
        },
        headers: {
          Authorization: auth,
        },
      })).data);

    const
      table = $('body > center > form > table.MainTable > tbody > tr.Col > td > table'),
      addresses: Address[] = [];

    table.find('select#avail_members > option').each((idx, row) => addresses.push({
      id: { time: row.attribs.value },
      name: row.children[0].data,
    }));
    addresses.splice(0, 1);

    const group: AddressGroup = {
      id: {
        n: $('input[name="n"]').val(),
        time: $('input[name="id"]').val(),
      },
      name: table.find('input[name="name"]').val(),
      addresses,
    };

    return group;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const getAllAddressGroupDetail = async ({ auth, flr }: FloorAuth) => {
  const groups = await getAllAddressGroup({ auth, flr });
  await Promise.all(
    groups?.map(async (group) => {
      const detail = await getAddressGroup({ auth, flr }, { id: group.id });
      group.addresses = detail?.addresses;
    }) || [],
  );

  return groups;
};
