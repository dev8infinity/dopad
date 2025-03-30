import * as sqlFormatter from 'sql-formatter';

export function formatJson(jsonText: string): string | undefined{
try {
        const jsonObject = JSON.parse(jsonText); // Parse the JSON string
        return JSON.stringify(jsonObject, null, 4); // Format with 4 spaces indentation
    } catch (error) {
        console.log("Invalid JSON input");
        console.log(error);
        return undefined;
    }
}

export function formatSql(sqlText: string): string {
    return sqlFormatter.format(sqlText);
}
