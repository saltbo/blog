
export default {
    computed: {

    },
    methods: {
        compareDate(a, b) {
            function getTimeNum(date) {
                return new Date(date.frontmatter.date).getTime();
            }
            return getTimeNum(b) - getTimeNum(a);
        },
        sortPostsByDate(posts) {
            posts.sort((prev, next) => {
                return this.compareDate(prev, next);
            });
        },
    }
}

function renderTime(date) {
    var dateee = new Date(date).toJSON()
    return new Date(+new Date(dateee) + 8 * 3600 * 1000).toISOString().replace(/T/g, ' ').replace(/\.[\d]{3}Z/, '').replace(/-/g, '/')
}
function dateFormat(date, type) {
    date = renderTime(date)
    const dateObj = new Date(date)
    const year = dateObj.getFullYear()
    const mon = dateObj.getMonth() + 1
    const day = dateObj.getDate()
    if (type == 'year') return year
    else return `${mon}-${day}`
}
