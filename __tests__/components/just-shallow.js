import { shallow } from 'enzyme';

describe('Button', () => {
  it('should meet basic accessibility criteria', async () => {
    const component = shallow(<Button />).html();

    expect(await axe(component)).toHaveNoViolations();
  });
});
